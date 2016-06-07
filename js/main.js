var dashboardApp = angular.module('dashboardApp', []);

$(function () {
  $("ul.nav li").click(function () {
    $("ul.nav li").removeClass('active');
    $(this).addClass('active');
  });
});


//Define Routing for the app
//Uri /xfails -> xfails.html and Controller XfailsController
//Uri /issues -> template issues.html and Controller IssuesController
dashboardApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/issues', {
        templateUrl: 'templates/issues.html',
        controller: 'IssuesController'
      }).
      when('/pullrequests', {
          templateUrl: ' templates/pullrequests.html',
          controller: 'PullRequestsController'
      }).
      when('/xfails', {
        templateUrl: 'templates/xfails.html',
        controller: 'XfailsController'
      }).
      otherwise({
        redirectTo: '/issues'
      });
  }]);

dashboardApp.controller('XfailsController',function ($scope, $http, $q, $rootScope, $filter) {
  $scope.parse_data = {};

  $scope.init = function () {
    $("#nav-xfail").addClass('active');
    $http.get('config.json').success(function (data) {
      var repos = data.repos;
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

dashboardApp.controller('IssuesController', function ($scope, $http, filterFilter) {

  $scope.init = function () {
    $("#nav-issues").addClass('active');
    var aggregator = new GithubIssuesAggregator();

    $scope.issueFilters = {'hasPullRequest': '', 'hasAssignee': ''};

    var labelArray = ['Community', 'blocked',
      'difficulty beginner', 'difficulty intermediate', 'difficulty advanced',
      'priority low', 'priority medium', 'priority high']
    $scope.labels = labelArray.map(function (label) {
      return {'name': label, selected: false}
    });

    // selected labels
    $scope.selection = [];

    // helper method
    $scope.selectedLabels = function selectedLabels() {
      return filterFilter($scope.labels, { selected: true });
    };

    aggregator.processIssues(function (data) {
      $scope.issues = data.issues;
      $scope.last_updated = data.last_updated;

      // watch labels for changes
      $scope.$watch('labels|filter:{selected:true}', function (nv) {
        $scope.selection = nv.map(function (label) {
          return label.name;
        });
        $scope.showHideIssues();
      }, true);

      // Set up display properties for the issues
      angular.forEach($scope.issues, function (repo) {
        repo.show = true;
        repo.prCount = 0;
        angular.forEach(repo.issues, function (issue) {
            if ($scope.hasPullRequest | issue.pull_request) {
                issue.shouldShow = false;
                repo.prCount++;
            }
            else {
                issue.shouldShow = true;
            }
        });
        repo.issueCount = repo.issues.length - repo.prCount
      });
      setTimeout(Hyphenator.run, 200);
      $scope.$apply();
    });

  }

  $scope.toggleRepo = function (repo) {
    repo.show = !repo.show;
  }

  $scope.showHideIssues = function () {
    for (var a = 0; a < $scope.issues.length; a++) {
      issues = $scope.issues[a].issues;
      for (var b = 0; b < issues.length; b++) {
        issue = issues[b];
        if ($scope.hasPullRequest | issue.pull_request) {
            issue.shouldShow = false;
        }
        else {
            issue.shouldShow = true;
        }
        var showForLabels = true;
        if (issue.shouldShow && $scope.selectedLabels().length > 0) {
          showForLabels = false;
          matchedLabels = 0;
          for (var c = 0; c < issue.labels.length; c++) {
            for (var d = 0; d < $scope.selectedLabels().length; d++) {
              if (issue.labels[c]['name'] == $scope.selectedLabels()[d].name) {
                matchedLabels++;
              }
            }
          }
          if (matchedLabels == $scope.selectedLabels().length) {
            showForLabels = true;

          }
          issue.shouldShow = issue.shouldShow && showForLabels;
        }
        var showForAssignee = true;
        if (issue.shouldShow && $scope.hasAssignee != 'undefined' && $scope.hasAssignee != null | $scope.hasAssignee == '') {
          showForAssignee = $scope.hasAssignee == ''
                            | (issue.assignee.name && $scope.hasAssignee == 'yes')
                            | (!issue.assignee.name && $scope.hasAssignee == 'no');
          issue.shouldShow = issue.shouldShow && showForAssignee;
        }
      }
    }
    }
});

dashboardApp.controller('PullRequestsController', function ($scope, $http, filterFilter) {

    $scope.init = function () {
      $("#nav-pullrequests").addClass('active');
      var aggregator = new GithubIssuesAggregator();

      $scope.issueFilters = {'hasPullRequest': '', 'hasAssignee': ''};

      var labelArray = ['Community', 'blocked',
        'difficulty beginner', 'difficulty intermediate', 'difficulty advanced',
        'priority low', 'priority medium', 'priority high']
      $scope.labels = labelArray.map(function (label) {
        return {'name': label, selected: false}
      });

      // selected labels
      $scope.selection = [];

      // helper method
      $scope.selectedLabels = function selectedLabels() {
        return filterFilter($scope.labels, { selected: true });
      };

      aggregator.processIssues(function (data) {
        $scope.issues = data.issues;
        $scope.last_updated = data.last_updated;

        // watch labels for changes
        $scope.$watch('labels|filter:{selected:true}', function (nv) {
          $scope.selection = nv.map(function (label) {
            return label.name;
          });
          $scope.showHideIssues();
        }, true);

        // Set up display properties for the issues
        angular.forEach($scope.issues, function (repo) {
          repo.show = true;
          repo.prCount = 0;
          angular.forEach(repo.issues, function (issue) {
              if ($scope.hasPullRequest | issue.pull_request) {
                  issue.shouldShow = true;
                  repo.prCount++;
              }
              else {
                  issue.shouldShow = false;
              }
          });
        });

        setTimeout(Hyphenator.run, 200);
        $scope.$apply();
      });

    }

    $scope.toggleRepo = function (repo) {
      repo.show = !repo.show;
    }

    $scope.showHideIssues = function () {
      for (var a = 0; a < $scope.issues.length; a++) {
        issues = $scope.issues[a].issues;
        for (var b = 0; b < issues.length; b++) {
          issue = issues[b];
          if ($scope.hasPullRequest | issue.pull_request) {
              issue.shouldShow = true;
          }
          else {
              issue.shouldShow = false;
          }
          var showForLabels = true;
          if (issue.shouldShow && $scope.selectedLabels().length > 0) {
            showForLabels = false;
            matchedLabels = 0;
            for (var c = 0; c < issue.labels.length; c++) {
              for (var d = 0; d < $scope.selectedLabels().length; d++) {
                if (issue.labels[c]['name'] == $scope.selectedLabels()[d].name) {
                  matchedLabels++;
                }
              }
            }
            if (matchedLabels == $scope.selectedLabels().length) {
              showForLabels = true;

            }
            issue.shouldShow = issue.shouldShow && showForLabels;
          }
          var showForAssignee = true;
          if (issue.shouldShow && $scope.hasAssignee != 'undefined' && $scope.hasAssignee != null | $scope.hasAssignee == '') {
            showForAssignee = $scope.hasAssignee == ''
                              | (issue.assignee.name && $scope.hasAssignee == 'yes')
                              | (!issue.assignee.name && $scope.hasAssignee == 'no');
            issue.shouldShow = issue.shouldShow && showForAssignee;
          }
        }
      }
    }
});
