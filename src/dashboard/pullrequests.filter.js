(function() {
'use strict';

angular.module('dashboardApp')
.filter('pullRequests', pullRequests);

function pullRequests() {

    return function(input, pullRequest) {
        var out = [];
        angular.forEach(input, function(issue) {
            // If on Pull Requests "page" AND issue is a PR, then show.
            if(pullRequest && issue.pull_request) {
                out.push(issue);
            }
            // Else if not on Pull Requests "page", show all.
            else if (!pullRequest) {
                out.push(issue);
            }
        })
        return out;
    }
}

})();
