(function() {
'use strict';

angular.module('dashboardApp')
.controller('FeedController', FeedController);

FeedController.$inject = ['$scope', '$http', '$q', 'IssueFeedService'];
function FeedController($scope, $http, $q, IssueFeedService) {
    var feed = this;
    // Time for 'Last Updated'.
    feed.time = new Date();
    // Is this the pull requests page?
    $scope.pullRequest = false;


    // Assigned filter
    $scope.assigned =  [
        { name: 'Assigned', selected: false },
        { name: 'Unassigned', selected: false }
    ];

    //Uncheck all filters
    $scope.uncheckAll = function(input) {
        angular.forEach(input, function(value, key) {
            value.selected = false;
        });
    };

    var promise = IssueFeedService.getRepoList();

    // Fetch list of repositories from config.json.
    promise.then(function(response) {
        feed.repos = response.data['repos'];
        feed.apiToken = response.data['apiToken'];

        // Get issues for each repository.
        angular.forEach(feed.repos, function(repo) {
            var promise = IssueFeedService.getIssues(repo.owner, repo.name, feed.apiToken);

            promise.then(function(response) {
                // Only add 'issues' array if open issues exist.
                if (response.data.length > 0) {
                    repo['issues'] = response.data;
                }
            }, function error(response) {
                console.log('An error has occurred while fetching repository issues.');
            });
        });
        console.log(feed.repos);
    }, function error(response) {
        console.log('An error has occurred while fetching list of repositories.');
    });

    $scope.pullRequestFalse = function() {
        $scope.pullRequest = false;
    }

    $scope.pullRequestTrue = function() {
        $scope.pullRequest = true;
    }
}


})();
