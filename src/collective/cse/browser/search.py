# -*- coding: utf-8 -*-
from collective.cse.interfaces import ICollectiveCSESettings
from collections import OrderedDict
from googleapiclient.discovery import build
from plone.registry.interfaces import IRegistry
from Products.Five.browser import BrowserView
from zope.component import getUtility
import logging

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

        if self.settings.cse_id:
            results = template % self.settings.cse_id
        else:
            results = template % ""

        return results

    # XXX: Below here are methods used for the custom search using googleapi
    def __call__(self, *args, **kw):
        query = self.query
        if not self.use_default_widget and query:
            if self.settings.api_key:
                self.configured = True
                service = build('customsearch', 'v1',
                                developerKey=self.settings.api_key)
                cse = service.cse()
                start = self.start
                if self.refinement and self.refinement in self.list_of_refinements:
                    query = '{} more:{}'.format(query, self.refinement)
                args = dict(q=query, cx=self.settings.cse_id,
                            num=BATCH_SIZE, start=start, gl='us')
                if self.sort_by and self.sort_by in self.list_sorting:
                    args['sort'] = self.sort_by
                req = cse.list(**args)
                self.results = res = req.execute()
                self.total = total = min(int(res['searchInformation']['totalResults']), MAX_RESULTS)
                self.formatted_total = res['searchInformation']['formattedTotalResults']
                extra_page = total % BATCH_SIZE != 0 and 1 or 0
                page_count = total / BATCH_SIZE + extra_page
                self.last_page = page_count
                if 'nextPage' in res['queries']:
                    start = res['queries']['nextPage'][0]['startIndex']
                    if start < MAX_RESULTS:
                        self.next = page_number(start)
                if 'previousPage' in res['queries']:
                    start = res['queries']['previousPage'][0]['startIndex']
                    self.previous = page_number(start)
                page = self.page
                last_page = self.last_page
                next_range = range(int(page) + 1, int(page) + 5)
                next_pages = [n for n in next_range if n <= last_page]
                previous_range = range(int(page) - 1, int(page) - 5, -1)
                previous_pages = [n for n in previous_range if n > 0]
                previous_pages.reverse()
                self.next_pages = next_pages
                self.previous_pages = previous_pages
            else:
                self.configured = False
        return self.index(*args, **kw)

    @property
    def page(self):
        try:
            return int(self.request.form.get('page', '1'))
        except ValueError:
            return 1

    @property
    def query(self):
        query = self.request.form.get('q', '')
        return query

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
            for ref_line in self.settings.refinements.split():
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
    def sort_by(self):
        return self.request.form.get('sort_by', '')

    @property
    def list_sorting(self):
        results = list()
        if self.settings.sort_options:
            for sort_line in self.settings.sort_options.split():
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
