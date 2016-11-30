(function () {
'use strict';

angular.module('dashboardApp')
    .service('IssueFeedService', IssueFeedService);

IssueFeedService.$inject = ['$http', '$q', 'REPO_CONFIG_URL', 'GITHUB_API_PATH'];
function IssueFeedService($http, $q, REPO_CONFIG_URL, GITHUB_API_PATH) {
    var service = this;

    service.getRepoList = function() {
        var response = $http({
            method: 'GET',
            url: (REPO_CONFIG_URL)
        });
        return response;
    };

    service.getIssues = function(repoOwner, repoName, apiToken) {
        var response = $http({
            method: 'GET',
            url: (GITHUB_API_PATH + repoOwner + '/' + repoName + '/issues'),
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
