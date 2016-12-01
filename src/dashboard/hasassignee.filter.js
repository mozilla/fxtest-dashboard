(function() {
'use strict';

angular.module('dashboardApp')
.filter('hasAssignee', hasAssignee);

function hasAssignee() {

    return function(input, assigned) {
        var out = [];
        angular.forEach(input, function(issue) {
            // If Neither Assigned nor Unassigned OR BOTH is/are selected, show all.
            if(assigned[0].selected && assigned[1].selected || !assigned[0].selected && !assigned[1].selected){
                out.push(issue);
            }
            // Else if only 'Assigned' is selected && issue is assigned
            else if (assigned[0].selected && issue.assignee !== null) {
                out.push(issue);
            }
            // Else if only 'Unassigned' is selected && issue is NOT assigned
            else if (assigned[1].selected && issue.assignee === null) {
                out.push(issue);
            }
        })

        return out;
    }
}

})();
