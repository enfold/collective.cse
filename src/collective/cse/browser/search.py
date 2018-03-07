# -*- coding: utf-8 -*-
from Acquisition import aq_inner
from Acquisition import aq_parent
from collective.cse.interfaces import ICollectiveCSESettings
from collective.cse.interfaces import ICSECustomData
from collections import OrderedDict
from googleapiclient.discovery import build
from plone.app.layout.navigation.interfaces import INavigationRoot
from plone.registry.interfaces import IRegistry
from Products.Five.browser import BrowserView
from zope.component import getAdapters
from zope.component import getUtility
from time import sleep
import json
import logging
import os

logger = logging.getLogger('collective.cse.browser.search')

BATCH_SIZE = 10  # 10 is the max supported by google
MAX_RESULTS = 100  # This is enforced by google


def page_number(start):
    return start / BATCH_SIZE + 1


def start_count(page):
    return (page - 1) * BATCH_SIZE + 1


class CSEView(BrowserView):

    results = None
    configured = False
    next = False
    previous = False

    @property
    def sort_by(self):
        return self.request.form.get('sort_by', '')

    @property
    def query(self):
        query = self.request.form.get('q', '')
        return query

    @property
    def extra_args(self):
        extra_args = self.request.form.get('extra_args', '')
        try:
            extra_args = json.loads(extra_args)
        except:
            # Object sent is not a json, so just pass
            pass
        return extra_args

    @property
    def settings(self):
        registry = getUtility(IRegistry)
        settings = registry.forInterface(ICollectiveCSESettings, check=False)
        return settings

    @property
    def use_default_widget(self):
        return self.settings.use_default_widget

    def getDefaultJSSnippet(self):
        template = """
        (function() {
            var cx = '%s';
            var gcse = document.createElement('script');
            gcse.type = 'text/javascript';
            gcse.async = true;
            gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(gcse, s);
        })();
        """

        cse_id = self.settings.cse_id
        if not cse_id:
            cse_id = os.getenv("CSE_CSE_ID")

        if cse_id:
            results = template % cse_id
        else:
            results = template % ""

        return results

    # XXX: Below here are methods used for the custom search using googleapi
    def __call__(self, *args, **kw):
        if not self.use_default_widget:
            if not self.settings.api_key:
                self.configured = False
        return self.index(*args, **kw)

    @property
    def page(self):
        try:
            return int(self.request.form.get('page', '1'))
        except ValueError:
            return 1

    @property
    def start(self):
        return start_count(self.page)

    @property
    def end(self):
        if self.has_results:
            count = self.results['queries']['request'][0]['count']
            return self.start + count - 1
        return 0

    @property
    def has_results(self):
        return self.results and self.total > 0

    @property
    def show_pagination(self):
        return self.next or self.previous

    @property
    def refinement(self):
        return self.request.form.get('refinement', '')

    @property
    def list_of_refinements(self):
        results = list()
        if self.settings.refinements:
            if '\r\n' in self.settings.refinements:
                splitted_refinements = self.settings.refinements.split('\r\n')
            elif '\n' in self.settings.refinements:
                splitted_refinements = self.settings.refinements.split('\n')
            else:
                splitted_refinements = self.settings.refinements.split()
            for ref_line in splitted_refinements:
                split_line = ref_line.split('|')
                if len(split_line) == 2:
                    results.append((split_line[0], split_line[1]))
        return OrderedDict(results)

    @property
    def refinement_options(self):
        results = list()
        if self.list_of_refinements:
            results.append({'label': u"All", 'value': u""})
            for k,v in self.list_of_refinements.items():
                results.append({'value': k, 'label': v})

        return results

    @property
    def list_sorting(self):
        results = list()
        if self.settings.sort_options:
            if '\r\n' in self.settings.sort_options:
                splitted_sort = self.settings.sort_options.split('\r\n')
            elif '\n' in self.settings.sort_options:
                splitted_sort = self.settings.sort_options.split('\n')
            else:
                splitted_sort = self.settings.sort_options.split()
            for sort_line in splitted_sort:
                split_line = sort_line.split('|')
                if len(split_line) == 2:
                    results.append((split_line[0], split_line[1]))
        return OrderedDict(results)

    @property
    def sort_options(self):
        results = list()
        if self.list_sorting:
            for k,v in self.list_sorting.items():
                results.append({'value': k, 'label': v})

        return results

    @property
    def search_url(self):
        context = aq_inner(self.context)
        while not INavigationRoot.providedBy(context):
            context = aq_inner(aq_parent(context))
        return u"%s/@@csesearch" % context.absolute_url()


class CSEJsonSearchResults(CSEView):
    search_tries = 0
    limit_retries = 5
    wait_seconds_retry = 2
    valid_search = False

    def search_and_retry(self, req):
        # XXX: An alternative to this implementation would be to call execute with num_
        # retries argument set to some number, however here we can control the time
        # between retries and retry on any error, not only 500's from Google
        # https://google.github.io/google-api-python-client/docs/epy/googleapiclient.http.HttpRequest-class.html#execute
        res = None
        if not self.valid_search:
            self.search_tries += 1
            try:
                res = req.execute()
                self.valid_search = True
            except Exception as e:
                logger.error("An error occurred while trying to get search results. Attempt %s of %s" % (self.search_tries, self.limit_retries))
                logger.error(e)
                if self.search_tries < self.limit_retries:
                    logger.error("Waiting %s seconds and retrying." % self.wait_seconds_retry)
                    sleep(self.wait_seconds_retry)
                    res = self.search_and_retry(req)
                else:
                    logger.error("Too many attempts tried. Giving up")

        return res

    def __call__(self, *args, **kw):
        results = {'total': 0}
        results['query'] = query = self.query
        results['show_promotions'] = self.settings.show_promotions
        api_key = None
        cse_id = None
        if query:
            api_key = self.settings.api_key
            if not api_key:
                api_key = os.getenv("CSE_API_KEY")
            if api_key:
                self.configured = True
                cse_id = self.settings.cse_id
                if not cse_id:
                    cse_id = os.getenv("CSE_CSE_ID")

                service = build('customsearch', 'v1',
                                developerKey=api_key)
                cse = service.cse()
                start = self.start
                results['all_refinements'] = self.refinement_options
                if self.refinement and self.refinement in self.list_of_refinements:
                    query = '{} more:{}'.format(query, self.refinement)
                    results['refinement'] = self.refinement
                args = dict(q=query, cx=cse_id,
                            num=BATCH_SIZE, start=start, gl='us')
                if self.sort_by and self.sort_by in self.list_sorting:
                    args['sort'] = self.sort_by

                custom_data_sources = getAdapters((self.context, self.request), ICSECustomData)
                for name,adapter in custom_data_sources:
                    args = adapter(args, self.extra_args)

                if args.get('cx'):
                    req = cse.list(**args)
                    results['results'] = self.results = res = self.search_and_retry(req)
                    if res:
                        # XXX: Google includes <br> and \n with its htmlSnippets, remove those here
                        if 'items' in self.results:
                            for item in self.results['items']:
                                if 'htmlSnippet' in item:
                                    item['htmlSnippet'] = item['htmlSnippet'].replace('<br>', '')
                                    item['htmlSnippet'] = item['htmlSnippet'].replace('\n', '')

                        results['total'] = self.total = total = min(int(res['searchInformation']['totalResults']), MAX_RESULTS)
                        results['formatted_total'] = res['searchInformation']['formattedTotalResults']
                        extra_page = total % BATCH_SIZE != 0 and 1 or 0
                        page_count = total / BATCH_SIZE + extra_page
                        results['last_page'] = last_page = page_count
                        if 'nextPage' in res['queries']:
                            start = res['queries']['nextPage'][0]['startIndex']
                            if start < MAX_RESULTS:
                                results['next'] = page_number(start)
                        if 'previousPage' in res['queries']:
                            start = res['queries']['previousPage'][0]['startIndex']
                            results['previous'] = page_number(start)

                        results['show_pagination'] = 'next' in results or 'previous' in results

                        results['page'] = page = self.page
                        next_range = range(int(page) + 1, int(page) + 5)
                        next_pages = [n for n in next_range if n <= last_page]
                        previous_range = range(int(page) - 1, int(page) - 5, -1)
                        previous_pages = [n for n in previous_range if n > 0]
                        previous_pages.reverse()
                        results['next_pages'] = next_pages
                        results['previous_pages'] = previous_pages
                        results['start'] = self.start
                        results['end'] = self.end
            if not api_key or not args.get('cx'):
                self.configured = False
        self.request.response.setHeader('Content-Type', 'application/json')
        return json.dumps(results)

