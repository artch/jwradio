var mod = angular.module('app.config', []);

mod.config(function(ApiProvider) {
    ApiProvider.options.apiUrl = 'http://localhost:3000/api/';
});