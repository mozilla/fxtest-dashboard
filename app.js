(function () {

    'use strict';

    angular.module('dashboardApp', ['angularMoment'])
        .controller('IssuesController', IssuesController)
        .controller('PullRequestsController', PullRequestsController)
        .controller('GithubReposController', GithubReposController)
        .service('GithubReposService', GithubReposService)
        .config(ConfigRoutes);

        ConfigRoutes.$inject = ['$routeProvider'];
        function ConfigRoutes($routeProvider) {
            $routeProvider.
                when ('/issues', {
                    templateUrl: 'templates/issues.html',
                    controller: 'IssuesController',
                    resolve: {
                        githubRepos: function(GithubReposService) {
                            return GithubReposService.getRepos();
                        }
                    }
                }).
                when ('/pullrequests', {
                    templateUrl: ' templates/pullrequests.html',
                    controller: 'PullRequestsController',
                    resolve: {
                        githubRepos: function(GithubReposService) {
                            return GithubReposService.getRepos();
                        }
                    }
                }).
                otherwise ({
                    redirectTo: '/issues'
                });
        }

        IssuesController.$inject = ['$scope', '$http'];
        function IssuesController($scope, $http) {

        }

        PullRequestsController.$inject = ['$scope', '$http'];
        function PullRequestsController($scope, $http) {

        }

        GithubReposController.$inject = ['$scope', '$http'];
        function GithubReposController($scope, $http) {
            var githubRepos = this;

            githubRepos.repos = GithubReposService.getRepos();
        }

        GithubReposService.$inject = ['$http', '$q'];
        function GithubReposService($http, $q) {
            var service = this;
            // List of Relevant Repositories.
            var configUrl = './config.json';
            // Base URL to Access Github Repos.
            var baseUrl = 'https://api.github.com/repos/';
            // Open Issues, Sorted by Creation Date.
            var urlSuffix = '/issues?per_page=100&state=open&sort=created&access_token=';
            // List of Repositories, Their Owners, and Their URLs.
            var repoList = [];
            var apiToken = '';
            // Promises for Queuing HTTP Requests.
            var promises = [];


            function getRepoList() {

                var deferred = $q.defer();
                $http({
                    url: configUrl
                }).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data) {
                    deferred.reject('An error has occurred.');
                });
                return deferred.promise;
            };

            function makePromises(){
                getRepoList()
                    .then(function(data) {
                        repoList = data.repos;
                        apiToken = data.apiToken;
                    }, function(data) {
                        alert(data);
                    });
                angular.forEach(repoList, function(repo) {
                    var promise = $http.get(baseUrl + repo.owner + '/' + repo.name + urlSuffix + apiToken);
                    promises.push(promise);
                });
            }

            service.getRepos() {
                makePromises();
                return $q.all(promises).then(function(results) {
                    var repos = [];
                    angular.forEach(results, function(result) {
                        repos.push(result);
                    });
                    return repos;
                });

            };
        }


})();
