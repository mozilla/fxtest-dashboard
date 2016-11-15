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
  - [$routeProvider](#routeprovider)

### config.json

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

### main.js

###### IIFE
Wrapping the code in an [IIFE](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression) `()();` prevents declared variables and functions from overflowing out of the scope.

###### 'use strict'
Specifying `'use strict';` will throw errors that will otherwise have been ignored.


###### Instantiation
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
###### DOM Manipulation

Throughout the app, there are several

###### $routeProvider

Using `$routeProvider` (main.js line 15) is unnecessary for this app. Instead of having two separate pages for Issues and Pull Requests,
(since pull requests are issues), you can use the same template and filter for pull requests when viewing the Pull Requests Page.
