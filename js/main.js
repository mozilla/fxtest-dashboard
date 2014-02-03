var dashboardApp = angular.module('dashboardApp', []);

$(function () {
  $("ul.nav li").click(function () {
    $("ul.nav li").removeClass('active');
    $(this).addClass('active');
  });
});


//Define Routing for the app
//Uri /xfails -> xfails.html and Controller XfailsController
//Uri /marketplace -> template marketplace.html and Controller MarketplaceController
//Uri /issues -> template issues.html and Controller IssuesController
dashboardApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/xfails', {
        templateUrl: 'templates/xfails.html',
        controller: 'XfailsController'
      }).
      when('/marketplace', {
        templateUrl: 'templates/marketplace.html',
        controller: 'MarketplaceController'
      }).
      when('/issues', {
        templateUrl: 'templates/issues.html',
        controller: 'IssuesController'
      }).
      otherwise({
        redirectTo: '/xfails'
      });
  }]);

dashboardApp.controller('XfailsController',function ($scope, $http, $q, $rootScope, $filter) {
  $scope.parse_data = {};

  $scope.init = function () {
    $("#nav-xfail").addClass('active');
    $http.get('repos.txt').success(function (data) {
      var repos = data.split('\n');
      for (var repo in repos) {
        repo = repos[repo].split('/');
        repo = repo[repo.length - 1];

        (function (repo_name) {
          $http.get('dumps/' + repo_name + '.json?t=' + new Date().getTime()).success(function (data) {
            $scope.parse_data[repo_name] = data['response'];

            var results;
            angular.forEach($scope.parse_data[repo_name], function (entry, entry_index) {
              (function () {
                results = entry.results;
                angular.forEach(results, function (result, result_type) {
                  angular.forEach(result.links, function (link, link_index) {
                    (function (repo_name, entry_index, result_type, link, link_index) {
                      var p = $q.defer();
                      $.get(link.url).success(function (data) {
                        var status, title;
                        if (link.url.search('github') != -1) {
                          status = data.state.toLowerCase();
                          title = data.title;
                        } else if (link.url.search('bugzilla') != -1) {
                          status = data.status + (typeof data.resolution != "undefined" ? ' - ' + data.resolution : "");
                          status = status.toLowerCase();
                          title = data.summary;
                        }

                        $rootScope.$apply(function () {
                          p.resolve({
                            'status': status,
                            'title': title
                          });
                        });
                      });

                      $scope.parse_data[repo_name][entry_index].results[result_type].links[link_index].bug_info = p.promise;
                    }(repo_name, entry_index, result_type, link, link_index));
                  });
                });
              }());
            });
            Hyphenator.run();
          });
        })(repo);
      }
      setTimeout(function () {
        Hyphenator.run();
      }, 500);
    });
  }
}).$inject = ['$scope', '$http', '$q', '$rootScope'];

var linkify = function () {
  var rules = [
    {
      'search': '((?:Bugzilla|bugzilla|bug|Bug) ([0-9]+))',
      'replace': '<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=$2">$1</a>',
    },
    {
      'function': function (text) {
        var urlPattern = /[^\"|\'](http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
        angular.forEach(text.match(urlPattern), function (url) {
          var anchorText = url;
          if (url.search('github') != -1 && url.search('issues') != -1) {
            var split = url.split('/');
            anchorText = split[3] + '/' + split[4] + '-#' + split[6];
          }
          text = text.replace(url, "<a href=\"" + url + "\">" + anchorText + "</a>");
        });
        return text;
      }
    }
  ];

  return function (input) {
    angular.forEach(rules, function (element, index, arr) {
      if ('search' in element) {
        input = input.replace(new RegExp(element.search), element.replace);
      } else if ('function' in element) {
        input = element.function(input);
      }
    });

    return input;
  };
};
dashboardApp.filter('linkify', linkify);

var isBugType = function () {
  return function (input, bugType) {
    if (typeof bugType == 'undefined' || bugType == null || bugType == "") {
      return input;
    } else {
      var out = [];
      bugType = bugType.split('|');

      for (var a = 0; a < input.length; a++) {
        for (var b in input[a].results) {
          for (var c = 0; c < input[a].results[b].links.length; c++) {
            for (var i = 0; i < bugType.length; i++) {
              if (input[a].results[b].links[c].bug_info.$$v.status.toLowerCase().search(bugType[i]) != -1) {
                out.push(input[a]);
              }
            }
          }
        }
      }

      setTimeout(Hyphenator.run, 200);
      return out;
    }
  };
}
dashboardApp.filter('isBugType', isBugType);

dashboardApp.controller('MarketplaceController', function ($scope, $http) {

  $scope.init = function () {
    $("#nav-marketplace").addClass('active');
    $http.get('data/marketplace_tests_results.json').success(function (data) {
      $scope.testResults = data;
      $scope.resultFilters = {'isPassing': true, 'isSkipping': true, 'isFailing': true};

      // Set up display properties for the groups
      angular.forEach($scope.testResults, function (group) {
        group.show = true;
        angular.forEach(group.test_results, function (test) {
          test.isPassing = test.passed.length;
          test.isSkipping = test.skipped.jobs && test.skipped.jobs.length;
          test.isFailing = test.failed.length;
          test.shouldShow = true;
        });

      });

      setTimeout(Hyphenator.run, 200);
    });

  }

  $scope.toggleGroup = function (group) {
    group.show = !group.show;
  }

  $scope.showHideResults = function () {
    for (var a = 0; a < $scope.testResults.length; a++) {
      test_results = $scope.testResults[a].test_results;
      for (var b = 0; b < test_results.length; b++) {
        test = test_results[b];
        test.shouldShow = $scope.resultType == 'undefined' | $scope.resultType == null | $scope.resultType == '' | test[$scope.resultType];
        if (test.shouldShow) {
          var showForEnv = false;
          for (var c = 0; c < test.environments.length; c++) {
            if ($scope.environment == 'undefined' | $scope.environment == null | $scope.environment == '' | test.environments[c] == $scope.environment) {
              showForEnv = true;
              break;
            }
          }
          test.shouldShow = test.shouldShow && showForEnv;
        }
      }
    }

  }
});

dashboardApp.controller('IssuesController', function ($scope, $http) {

  $scope.init = function () {
    $("#nav-issues").addClass('active');
    $http.get('data/repos_issues.json').success(function (data) {
      $scope.issues = data.issues;
      $scope.last_updated = data.last_updated;
      $scope.issueFilters = {'hasPullRequest': ''};

      // Set up display properties for the issues
      angular.forEach($scope.issues, function (repo) {
        repo.show = true;
        angular.forEach(repo.issues, function (issue) {
          issue.shouldShow = true;
        });

      });

      setTimeout(Hyphenator.run, 200);
    });

  }

  $scope.toggleRepo = function (repo) {
    repo.show = !repo.show;
  }

  $scope.showHideIssues = function () {
    console.log('$scope.hasPullRequest is: ' + $scope.hasPullRequest);
    for (var a = 0; a < $scope.issues.length; a++) {
      issues = $scope.issues[a].issues;
      for (var b = 0; b < issues.length; b++) {
        issue = issues[b];
        console.log('issue.pull_request.length: ' + issue.pull_request.length);
        console.log('$scope.hasPullRequest: ' + $scope.hasPullRequest);
        console.log(issue.pull_request.length > 0);
        console.log(Boolean($scope.hasPullRequest));
        console.log(issue.pull_request.length > 0 && Boolean($scope.hasPullRequest));

        issue.shouldShow = $scope.hasPullRequest == 'undefined' | $scope.hasPullRequest == null | $scope.hasPullRequest == '' |
          (issue.pull_request.length > 0 && $scope.hasPullRequest == 'yes') |  (issue.pull_request.length == 0 && $scope.hasPullRequest == 'no');
      }
    }

  }

});
