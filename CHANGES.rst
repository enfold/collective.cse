Changelog
=========


2.0.2 (unreleased)
------------------

- Drop support for Plone 4 and Plone 5. Only support Plone 6
  [frapell]


2.0.1 (2021-11-19)
------------------

- Replace .html usage in JS with .text to avoid HTML injection
  [frapell]


2.0.0 (2019-12-10)
------------------

- Python 3 ready
  [frapell]


1.2.1 (2019-06-24)
------------------

- Call @@csesearchresults for the higher NavigationRoot, which sometimes
  is not the actual site root.
  [frapell]


1.2.0 (2019-03-15)
------------------

- Make sure @@csesearchresults is called at site root
  [frapell]

- Add ability to customize the search results
  [frapell]


1.1.1 (2018-03-15)
------------------

- Decode query as utf-8
  [frapell]


1.1.0 (2018-03-13)
------------------

- Fix an issue were @@csesearchresults would be called on any path
  [frapell]

- Make the promotions to be optional to be rendered with results
  [frapell]

- Allow to customize the arguments sent to cse with adapters
  [frapell]

- When a request to Google fails, retry up to 5 times
  [frapell]


1.0.0 (2018-01-15)
------------------

- Package creation
  [frapell]

- Search view and search viewlet override
  [frapell]
