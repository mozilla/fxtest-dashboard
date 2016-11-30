(function() {
'use strict';

angular.module('dashboardApp')
.directive('githubRepository', githubRepository);

function githubRepository(){
    return {
        restrict: 'E',
        templateUrl: 'src/dashboard/githubrepository.template.html'
    };
}

})();
