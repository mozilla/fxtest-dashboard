(function() {
'use strict';

angular.module('dashboardApp')
.filter('hasAssignee', hasAssignee);

function hasAssignee() {

    return function(input, filterOptions) {
        var out = [];
        angular.forEach(input, function(issue) {
            if (filterOptions.name === 'Yes' && issue.assignee !== null){
                 out.push(issue);
             }
            else if (filterOptions.name === 'No' && issue.assignee === null){
                out.push(issue);
             }
            else if (filterOptions.name === '—') {
                out.push(issue);
            }
        })

        return out;
    }
}

})();
