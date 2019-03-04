var mod = angular.module('app', [
    'ngRoute',
    'route-segment',
    'view-segment',
    'app.api',
    'app.config',
    'app.login',
    'app.top',
    'app.index',
    'app.codes',
    'app.settings'
]);

mod.config(($locationProvider) => {
    $locationProvider.hashPrefix('!');
});