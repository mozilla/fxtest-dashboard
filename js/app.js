(function () {

    'use strict';

    angular.module('dashboardApp', ['angularMoment'])
        .controller('FeedController', FeedController)
        .constant('REPO_CONFIG_URL', 'config-new.json')
        .constant('API_BASE_PATH', 'https://api.github.com/repos/')
        .directive('githubIssue', githubIssue)
        .directive('githubRepository', githubRepository)
        .filter('hasAssignee', hasAssignee)
        .service('GithubIssueFeedService', GithubIssueFeedService);

        FeedController.$inject = ['$scope', '$http', '$q', 'GithubIssueFeedService'];
        function FeedController($scope, $http, $q, GithubIssueFeedService) {
            var feed = this;
            // Time for "Last Updated".
            feed.time = new Date();
            // Is this the pull requests page?
            $scope.pullRequest = false;
            // Array for Available Filters
            $scope.labels = [
                'enhancement',
                'help wanted',
                'question',
                'blocked',
                'beginner',
                'intermediate',
                'advanced',
                'urgent'
            ];
            $scope.filters = {
                filterHasAssignee: null,
                labels: []
            };

            var promise = GithubIssueFeedService.getRepoList();

            // Fetch list of repositories from config.json.
            promise.then(function(response) {
                feed.repos = response.data["repos"];
                feed.apiToken = response.data["apiToken"];

                // Get issues for each repository.
                angular.forEach(feed.repos, function(repo) {
                    var promise = GithubIssueFeedService.getRepoIssues(repo.owner, repo.name, feed.apiToken);

                    promise.then(function(response) {
                        // Only add "issues" array if open issues exist.
                        if (response.data.length > 0) {
                            repo["issues"] = response.data;
                        }
                    }, function error(response) {
                        console.log('An error has occurred while fetching repository issues.');
                    });
                });
                console.log(feed.repos);
            }, function error(response) {
                console.log('An error has occurred while fetching list of repositories.');
            });


            feed.hasPullRequests = function(repo) {
                var foundPR = false;
                angular.forEach(repo.issues, function(issue) {
                    if(issue.pull_request) {
                        foundPR = true;
                    }
                });
                return foundPR;
            }

            feed.countPullRequests = function(repo) {
                if (feed.hasPullRequests(repo)) {
                    var pullRequests = repo.issues.filter(function(item) {
                        return item.pull_request !== undefined;
                    });
                    return pullRequests.length;
                } else {
                    return 0;
                }
            }

            $scope.pullRequestFalse = function() {
                $scope.pullRequest = false;
            }

            $scope.pullRequestTrue = function() {
                $scope.pullRequest = true;
            }
        }


        function githubIssue(){
            return {
                restrict: 'E',
                templateUrl: 'templates/github-issue.html'
            };
        }

        function githubRepository(){
            return {
                restrict: 'E',
                templateUrl: 'templates/github-repository.html'
            };
        }

        function hasAssignee() {
            console.log(filter);
            return function(issue) {
                return issue.assignee !== null;
            };
        }


        GithubIssueFeedService.$inject = ['$http', '$q', 'REPO_CONFIG_URL', 'API_BASE_PATH'];
        function GithubIssueFeedService($http, $q, REPO_CONFIG_URL, API_BASE_PATH) {
            var service = this;

            service.getRepoList = function() {
                var response = $http({
                    method: 'GET',
                    url: (REPO_CONFIG_URL)
                });
                return response;
            };

            service.getRepoIssues = function(repoOwner, repoName, apiToken) {
                var response = $http({
                    method: 'GET',
                    url: (API_BASE_PATH + repoOwner + '/' + repoName + '/issues'),
                    params: {
                        per_page: 100,
                        state: 'open',
                        sort: 'created',
                        access_token: apiToken
                    }
                });
                return response;
            }

        }


})();
