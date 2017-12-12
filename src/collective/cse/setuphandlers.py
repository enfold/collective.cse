# -*- coding: utf-8 -*-
from Products.CMFPlone.interfaces import INonInstallable
from zope.interface import implementer

try:
    from Products.CMFPlone import __version__ as plone_version
except:
    plone_version = '4'


@implementer(INonInstallable)
class HiddenProfiles(object):

    def getNonInstallableProfiles(self):
        """Hide unwanted profiles from site-creation and quickinstaller."""
        return [
            'collective.cse:uninstall',
            'collective.cse:plone4',
            'collective.cse:plone5',
        ]


def post_install(context):
    """Post install script"""
    # Do something at the end of the installation of this package.


def uninstall(context):
    """Uninstall script"""
    # Do something at the end of the uninstallation of this package.


def import_various(context):
    """
    """
    if context.readDataFile('collective_cse_default.txt') is None:
        return
    portal = context.getSite()
    ps = portal.portal_setup

    if plone_version.startswith('4'):
        profile = 'profile-collective.cse:plone4'

    if plone_version.startswith('5'):
        profile = 'profile-collective.cse:plone5'

    ps.runAllImportStepsFromProfile(profile)
