(function () {
    'use strict';

    angular.module('dashboardApp', ['angularMoment'])
    .constant('REPO_CONFIG_URL', 'config.json')
    .constant('GITHUB_API_PATH', 'https://api.github.com/repos/');

})();
