# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from plone import api
from collective.cse.testing import COLLECTIVE_CSE_INTEGRATION_TESTING  # noqa

import unittest


class TestSetup(unittest.TestCase):
    """Test that collective.cse is properly installed."""

    layer = COLLECTIVE_CSE_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')

    def test_product_installed(self):
        """Test if collective.cse is installed."""
        self.assertTrue(self.installer.isProductInstalled(
            'collective.cse'))

    def test_browserlayer(self):
        """Test that ICollectiveCseLayer is registered."""
        from collective.cse.interfaces import (
            ICollectiveCseLayer)
        from plone.browserlayer import utils
        self.assertIn(
            ICollectiveCseLayer,
            utils.registered_layers())


class TestUninstall(unittest.TestCase):

    layer = COLLECTIVE_CSE_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')
        self.installer.uninstallProducts(['collective.cse'])

    def test_product_uninstalled(self):
        """Test if collective.cse is cleanly uninstalled."""
        self.assertFalse(self.installer.isProductInstalled(
            'collective.cse'))

    def test_browserlayer_removed(self):
        """Test that ICollectiveCseLayer is removed."""
        from collective.cse.interfaces import \
            ICollectiveCseLayer
        from plone.browserlayer import utils
        self.assertNotIn(
           ICollectiveCseLayer,
           utils.registered_layers())
