(function() {
'use strict';

angular.module('dashboardApp')
.filter('labels', labels);

function labels() {
    return function(input, selectedLabels) {
        var selected = [];
        // Create array of selected labels
        for(var i=0; i<selectedLabels.length; i++) {
            if(selectedLabels[i].selected) selected.push(selectedLabels[i].name);
        }
        // Run filter only if selected labels are found.
        if(selected.length > 0) {
            var out = [];
            angular.forEach(input, function(issue) {
                // Search for label only if issue has labels.
                if(issue.labels.length > 0) {
                    var match = true;
                    // Iterate through selected labels.
                    for(var i=0; i<selected.length; i++){
                        var found = false;
                        //Iterate through issue's labels.
                        for(var j=0; j<issue.labels.length; j++){
                            var curr = issue.labels[j].name;
                            if(curr == selected[i]) {
                                found = true;
                                break;
                            }
                        }
                        if(!found) {
                            match = false;
                            break;
                        }
                    }
                    if(match) out.push(issue);
                }
            });
            return out;
        }
        // Otherwise show all issues
        else {
            return input;
        }
    }
}

})();
