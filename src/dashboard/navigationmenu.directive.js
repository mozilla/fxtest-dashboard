(function() {
'use strict';

angular.module('dashboardApp')
.directive('navigationMenu', navigationMenu);

function navigationMenu(){
    return {
        restrict: 'E',
        templateUrl: 'src/dashboard/navigationmenu.template.html'
    };
}

})();
