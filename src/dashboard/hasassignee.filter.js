(function() {
'use strict';

angular.module('dashboardApp')
.filter('hasAssignee', hasAssignee);

function hasAssignee() {
    console.log(filter);
    return function(issue) {
        return issue.assignee !== null;
    };
}

})();
