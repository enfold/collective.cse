# -*- coding: utf-8 -*-
from collective.cse import _
from collective.cse.interfaces import ICollectiveCSESettings
from plone.app.registry.browser.controlpanel import ControlPanelFormWrapper
from plone.app.registry.browser.controlpanel import RegistryEditForm


class CollectiveCSEControlPanelEditForm(RegistryEditForm):
    schema = ICollectiveCSESettings

    label = _(u"Google Custom Search settings")
    description = _(u"Configure the Google Custom Search Plone integration.")


class CollectiveCSESettingsControlPanel(ControlPanelFormWrapper):
    form = CollectiveCSEControlPanelEditForm
