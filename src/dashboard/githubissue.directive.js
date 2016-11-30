(function() {
'use strict';

angular.module('dashboardApp')
.directive('githubIssue', githubIssue);

function githubIssue(){
    return {
        restrict: 'E',
        templateUrl: 'src/dashboard/githubissue.template.html'
    };
}

})();
