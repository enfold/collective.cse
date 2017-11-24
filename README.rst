.. This README is meant for consumption by humans and pypi. Pypi can render rst files so please do not use Sphinx features.
   If you want to learn more about writing documentation, please check out: http://docs.plone.org/about/documentation_styleguide.html
   This text does not appear on pypi or github. It is a comment.

==============
collective.cse
==============

This product integrates the Google Custom Search Engine (https://cse.google.com) into Plone

Features
--------

- Own search results page
- Overrides the search viewlet to redirect to the cse search results.
- Ability to use the Javascript provided by GCS, or the use of the Google API


Installation
------------

Install collective.cse by adding it to your buildout::

    [buildout]

    ...

    eggs =
        collective.cse


and then running ``bin/buildout``


Usage
-----

1. Create a Custom Search Engine in https://cse.google.com/cse/all
2. Make sure under "Look and feel" you choose "Results only" (You can customize the rest as desired)
3. Go to Plone's Site Setup and access the "Google Custom Search Engine Settings" tool
4. Enter your provided Search engine ID.

Now your site searches will use the Custom Search Engine you created.


Styling
-------

The search results page that uses the Google API, has css classes applied assuming your project will
be using Bootstrap.
There is no CSS provided, so it is easier to integrate this view in your project.


Contribute
----------

- Issue Tracker: https://github.com/enfold/collective.cse/issues
- Source Code: https://github.com/enfold/collective.cse


Support
-------

If you are having issues, please let us know by creating a ticket.


License
-------

The project is licensed under the GPLv2.
