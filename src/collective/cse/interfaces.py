# -*- coding: utf-8 -*-
"""Module where all interfaces, events and exceptions live."""
from collective.cse import _
from zope import schema
from zope.interface import Interface
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class ICollectiveCseLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class ICollectiveCSESettings(Interface):
    cse_id = schema.TextLine(
        title=_(u'Search engine ID'),
        description=_(u'Enter here the search ID, as found in https://cse.google.com/cse/all'),
        required=False,
    )

    use_default_widget = schema.Bool(
        title=_(u"Use widget provided by CSE"),
        description=_(
            u"Mark this checkbox to use the code provided by CSE by default. "
            u"If this checkbox is selected, all the configuration below "
            u"is ignored."),
        default=False,
        required=False)

    api_key = schema.TextLine(
        title=_(u'Google API Key'),
        description=_(u'Create an API key from https://console.developers.google.com.'),
        required=False,
    )

    refinements = schema.Text(
        title=_(u'Available refinements'),
        description=_(u'List here all available search refinements configured. Format: id|Title'),
        required=False,
        default=u"",
    )

    sort_options = schema.Text(
        title=_(u'Available sort options'),
        description=_(u'List here all available sorting options. Format: id|Title'),
        required=False,
        default=u"",
    )

    show_promotions = schema.Bool(
        title=_(u"Show Promotions"),
        description=_(
            u"Mark this checkbox to allow rendering promotions with the results."),
        default=False,
        required=False)


class ICSECustomData(Interface):
    """
    """


class ICSECustomizeResults(Interface):
    """
    """
