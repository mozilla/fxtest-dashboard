# Notes on App Refactor

###### Rewrite App to use the "Angular way"
###### Reduce Redundant Code
###### Improve Efficiency & Data Organization
###### Make Code More Modular & Reusable

## Contents

- [config.json](#configjson)
- [main.js](#mainjs)
  - [IIFE](#iife)
  - ['use strict'](#use-strict)
  - [Instantiation](#instantiation)
  - [Dependency Injection](#dependency-injection)
  - [DOM Manipulation](#dom-manipulation)
  - [jQuery](#jquery)
  - [$routeProvider](#routeprovider)
- [aggregator.js](#aggregatorjs)
- [Issues Addressed](#issues-addressed)
    - [#52](#issue-52)
    - [#60](#issue-60)
- [Mozilla Style Guides](#mozilla-style-guides)

___

# config.json

```
{
  "repos": [
    "https://github.com/mozilla/Addon-Tests",
    "https://github.com/mozilla/bidpom",
    "https://github.com/mozilla/fxapom",
    "https://github.com/mozilla/fxtestbot",
    "https://github.com/mozilla/hello-tests",
    "https://github.com/mozilla/moz-grid-config",
    "https://github.com/mozilla/mozillians-tests",

    .....

  ],
  "api_token": "692aadd2c9789a337c4d3544787f101ad8c35bc7"
}
```

Rather than an array of URLs, I restructed the `repos` array to contain Object Literals.
Including `https://github.com/` in every entry is redundant, becuase it will always be the same.

This also adds the redundant task of extracting the `owner` and `name` of the repository from each entry.

The new structure is as follows:

```
{
  "repos": [
      {
          "owner": "mozilla",
          "name": "Addon-Tests"
      },
      {
          "owner": "mozilla",
          "name": "bidpom"
      },
      {
          "owner": "mozilla",
          "name": "fxapom"
      },
      {
          "owner": "mozilla",
          "name": "fxtest-dashboard"
      },

      .....

      ],
      "api_token": "692aadd2c9789a337c4d3544787f101ad8c35bc7"
}
```

Within the FeedController, the `"repos"` array also becomes the data structure to
hold the array of issues for each repository, so each repo object also contains
its own issues. Currently they are two separate arrays. The issues is _only_
added to each `repo` entry _if open issues exist_.

___

# main.js

### IIFE
Wrapping the code in an [IIFE](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)
`()();` prevents declared variables and functions from overflowing out of the scope.

### 'use strict'
Specifying `'use strict';` will throw errors that will otherwise have been ignored.


### Instantiation
I moved the instantiation of all controllers, directives, services, etc., to the top of the page.
This both improves organization, and makes it clearly visible immediately what the contents of the file are.

__Example:__

```
angular.module('dashboardApp', ['angularMoment'])
    .controller('FeedController', FeedController)
    .constant('REPO_CONFIG_URL', 'config.json')
    .directive('githubIssue', githubIssue)

    ....
```

### Dependency Injection
The app is currently lacking dependency injection on both controllers&#8212;
`FeedController.$inject = ['$scope', 'GitHubIssueFeedService']` which protects the code from minification.

### DOM Manipulation

Throughout the app, there are several places where the code is directly manipulating the DOM, as with jQuery.
Being an [MVVM Framework](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel), this is not
recommended, as this can be done dynamically with AngularJS.

### jQuery

Much of the logic in the app is done via jQuery, not Angular. There are much simpler and more efficent
ways to implement the functionality using controllers, services, directives, etc.

### $routeProvider

Using `$routeProvider` (main.js line 15) is unnecessary for this app. Instead of
having two separate pages for Issues and Pull Requests, (since pull requests are issues),
you can use the same template and filter for pull requests when viewing the Pull Requests Page.

### Redundant Code
There are many places in the app where redundant code is used.

- IssuesController & PullRequestsController
  - These controllers are virtually the same, except the latter filters the data down to just pull requests.
  - The logic of showing only pull requests can be done using Angular filters and `ng-if` statements.
  - The controllers also set up redundant data structures, when all of the data
  can be accessed within the objects retrieved from the API


- Within the Controllers, there is a `forEach` loop (lines 65 & 165) that sets up
the display properties (should issue/repository be shown or not?). This can be done
automatically and dynamically with AngularJS.

- Line 85: `$scope.toggleRepo` is a function to show/hide repository when arrow
is clicked. Can be done using Angular's `ng-click` and `ng-show`.

- Line 89: `$scope.showHideIssues` is a function that loops through all of the data
every time something changes to determine whether or not it should be shown. All
it is unnecessary, the logic can be implemented using Angular filters and directives.

### Custom Directives

I have broken down all of the structure in `issues.html` into custom directives.
Instead of having index.html with the `ng-view` directive that loads templates
from the `routeProvider`, it now uses the custom directive `<github-repository>`
to display each repo with open issues.

Within the `githubRepository.html` template, there is the custom directive
`<github-issue>` which uses the `githubIssue.html` template.

I have used filters to display only pull requests when viewing the pull requests
"page" (clicking pull requests link), and viewing the issues "page" will display
all issues.

### Custom Service

___

# aggregator.js

This file handles most of the logic. All of the code in this file can be
incorporated into main.js within controllers, services, filters, etc. It makes
the API calls, and declares the data structures for the repositories and issues.

It is also guilty of using jQuery for almost all of the logic. Everything in
I have broken down into functions within GitHubIssueFeedService and FeedController.

Instead of using jQuery's getJSON method, we can utilize Angular's `$http` service.
This also eliminates the need for the paramaters in our API URL, as the $http service
can take `params: {}` and parse them appropriately.
___

# Issues Addressed

### Issue #52

While creating filter functionality, I decided to also address [Issue #52](https://github.com/mozilla/fxtest-dashboard/issues/52) to avoid rewriting the filters later.

Is Assigned filter is now a checkbox. Uncheck All links have been added.

### Issue #60

Also addressing this issue to avoid later rewrite. Labels are now pulled from the found open issues  [Issue #60](https://github.com/mozilla/fxtest-dashboard/issues/60)

___

# Mozilla Style Guides


I have edited all of the CSS, HTML, and JS files to abide by Mozilla's
[style guides](http://mozweb.readthedocs.io/en/latest/reference/index.html). I have taken care to give meaningful variable and function names.

I also add comments next to closing tags in HTML, as a preference, to make it
easier on both myself and anyone else who may read the code after me.

_Edit: main.css has not yet been edited to follow style guides._
