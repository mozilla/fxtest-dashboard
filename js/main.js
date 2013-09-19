var app = angular.module('dashboard', []);

var TestAnalysisCtrl = function($scope, $http, $q, $rootScope, $filter) {
    $scope.parse_data = {};

    $scope.init = function() {
        $http.get('repos.txt').success(function(data) {
            var repos = data.split('\n');
            for (var repo in repos) {
                repo = repos[repo].split('/');
                repo = repo[repo.length - 1];
                
                (function(repo_name) {
                    $http.get('dumps/' + repo_name + '.json?t=' + new Date().getTime()).success(function(data) {
                        $scope.parse_data[repo_name] = data['response'];

                        var results;
                        angular.forEach($scope.parse_data[repo_name], function(entry, entry_index) {
                            (function() {
                                results = entry.results;
                                angular.forEach(results, function(result, result_type) {
                                    angular.forEach(result.links, function(link, link_index) {
                                        (function(repo_name, entry_index, result_type, link, link_index) {
                                            var p = $q.defer();
                                            $.get(link.url).success(function(data) {
                                                var status, title;
                                                if (link.url.search('github') != -1) {
                                                    status = data.state.toLowerCase();
                                                    title = data.title;
                                                } else if (link.url.search('bugzilla') != -1) {
                                                    status = data.status + (typeof data.resolution != "undefined" ? ' - ' + data.resolution : "");
                                                    status = status.toLowerCase();
                                                    title = data.summary;
                                                }

                                                $rootScope.$apply(function() {
                                                    p.resolve({
                                                        'status': status,
                                                        'title': title
                                                    });
                                                });
                                            });

                                            $scope.parse_data[repo_name][entry_index].results[result_type].links[link_index].bug_info = p.promise;
                                        } (repo_name, entry_index, result_type, link, link_index));
                                    });
                                });
                            }());
                        });
                        Hyphenator.run();
                    });
                }) (repo);
            }
            setTimeout(function() { Hyphenator.run(); }, 500);
        });
    }
};
TestAnalysisCtrl.$inject = ['$scope', '$http', '$q', '$rootScope'];

var linkify = function() {
    var rules = [
        {
            'search': '((?:Bugzilla|bugzilla|bug|Bug) ([0-9]+))',
            'replace': '<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=$2">$1</a>',
        },
        {
            'function': function(text) {
                var urlPattern = /[^\"|\'](http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
                angular.forEach(text.match(urlPattern), function(url) {
                    var anchorText = url;
                    if (url.search('github') != -1 && url.search('issues') != -1) {
                        var split = url.split('/');
                        anchorText = split[3] + '/' + split[4] + '-#' + split[6];
                    }
                    text = text.replace(url, "<a href=\"" + url + "\">" + anchorText +"</a>");
                });
                return text;
            },
        },
    ];

    return function(input) {
        angular.forEach(rules, function(element, index, arr) {
            if ('search' in element) {
                input = input.replace(new RegExp(element.search), element.replace);
            } else if ('function' in element) {
                input = element.function(input);
            }
        });

        return input;
    };
};
app.filter('linkify', linkify);

var isBugType = function() {
    return function(input, bugType) {
        if (typeof bugType == 'undefined' || bugType == null || bugType == "") {
            return input;
        } else {
            var out = [];
            bugType = bugType.split('|');

            for (var a = 0; a < input.length; a++) {
                for (var b in input[a].results) {
                    for (var c = 0; c < input[a].results[b].links.length; c++) {
                        for (var i = 0; i < bugType.length; i++) {
                            if (input[a].results[b].links[c].bug_info.$$v.status.toLowerCase().search(bugType[i]) != -1) {
                                out.push(input[a]);
                            }
                        }
                    }
                }
            }

            setTimeout(Hyphenator.run, 200);
            return out;
        }
    };
}
app.filter('isBugType', isBugType);
