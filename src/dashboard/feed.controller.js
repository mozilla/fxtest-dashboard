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

    // Label filters
    $scope.labels = [];
    $scope.selectedLabels = [];

    // Check all filters
    $scope.checkAll = function(input) {
        angular.forEach(input, function(value, key) {
            value.selected = true;
        });
    };

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

                    // Populate Labels array with found Labels
                    for(var i=0; i<response.data.length; i++) {
                        var curr = response.data[i];
                        if (curr.labels) {
                            var labels = curr.labels;
                            for(var j = 0; j<labels.length; j++) {
                                if($scope.labels.indexOf(labels[j].name) < 0) {
                                    $scope.labels.push(labels[j].name);
                                    $scope.selectedLabels.push({name: labels[j].name, selected: false});
                                }
                            }
                        }
                    }
                }
            }, function error(response) {
                console.log('An error has occurred while fetching repository issues.');
            });
        });
    }, function error(response) {
        console.log('An error has occurred while fetching list of repositories.');
    });

    $scope.pullRequestFalse = function() {
        $scope.pullRequest = false;
        if ($scope.menu.state) $scope.menu.state = false;
    }

    $scope.pullRequestTrue = function() {
        $scope.pullRequest = true;
        if ($scope.menu.state) $scope.menu.state = false;
    }
}


})();
