(function () {

    'use strict';

    angular.module('dashboardApp', ['angularMoment'])
        .controller('FeedController', FeedController)
        .controller('RepoController', RepoController)
        .directive('githubIssue', githubIssue)
        .directive('githubRepository', githubRepository)
        .factory('GithubIssueFeedService', GithubIssueFeedService);

        FeedController.$inject = ['$scope', '$http', '$q', 'GithubIssueFeedService'];
        function FeedController($scope, $http, $q, GithubIssueFeedService) {
            var feed = this;
            var baseUrl = 'https://api.github.com/repos/';
            GithubIssueFeedService.getRepoConfig().then(function(response) {
                feed.repos = response.data["repos"];
                feed.apiToken = response.data["apiToken"];
                var promises = [];
                angular.forEach(feed.repos, function(repo) {
                    var promise = $http({
                        method: 'GET',
                        url: baseUrl + repo.owner + '/' + repo.name + '/issues',
                        params: {
                            per_page: 100,
                            state: 'open',
                            sort: 'created',
                            access_token: feed.apiToken
                        }
                    }).then(function success(response) {
                        repo["issues"] = response.data;
                    }, function error(response) {
                        console.log('An error has occurred.');
                    });
                });
                console.log(feed.repos);
            });
        }

        RepoController.$inject = ['GithubIssueFeedService'];
        function RepoController(GithubIssueFeedService) {

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


        GithubIssueFeedService.$inject = ['$http', '$q'];
        function GithubIssueFeedService($http, $q) {
            var service = this;
            // List of Relevant Repositories.
            var configUrl = 'config-new.json';
            // Base URL to Access Github Repos.
            var baseUrl = 'https://api.github.com/repos/';

            return {
                getRepoConfig: function() {
                    return $http.get(configUrl);
                },
                getIssues: function() {
                    return $http.get()
                }
            }
        }


})();
