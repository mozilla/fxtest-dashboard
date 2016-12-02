(function() {
'use strict';

angular.module('dashboardApp')
.directive('filterList', filterList);

function filterList(){
    return {
        restrict: 'E',
        templateUrl: 'src/dashboard/filterlist.template.html'
    };
}

})();
