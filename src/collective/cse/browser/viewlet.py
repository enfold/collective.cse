from plone.app.layout.viewlets.common import SearchBoxViewlet
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class CSESearchbox(SearchBoxViewlet):
    # TODO: Add a condition in the control panel to override the viewlet or not

    index = ViewPageTemplateFile('searchbox.pt')

    def update(self):
        super(CSESearchbox, self).update()
        self.search_input_id = "cse-viewlet-search-string"
