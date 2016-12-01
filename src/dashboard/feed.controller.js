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



    $scope.filterOptions = {
        hasAssignee: [
            { name: '—' },
            { name: 'Yes' },
            { name: 'No' }
        ],
        labels: [
            'enhancement',
            'help wanted',
            'question',
            'blocked',
            'beginner',
            'intermediate',
            'advanced',
            'urgent'
        ]
    };

    //Mapped to the model to filter
    $scope.filterItem = {
      assignee: $scope.filterOptions.hasAssignee[0]
    };
    console.log($scope.filterItem.assignee.name);
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


})();
