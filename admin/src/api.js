var mod = angular.module('app.api', []);


mod.provider('Api', function($httpProvider) {

    var options = this.options = {
        apiUrl: '',
    };

    $httpProvider.interceptors.push(function($location, $q) {

        return {
            responseError: function(rejection) {
                if(rejection.status == 401 && !/login/.test(rejection.config.url)) {
                    $location.url('/login');
                }
                return $q.reject(rejection);
            }
        };
    });

    this.$get = function($injector, $q) {

        var Api;

        var errorHandler = function(response) {
            return $q.reject(response);
        };

        return Api = {

            options,

            post(endpoint, params) {

                var $http = $injector.get('$http');
                return $http.post(options.apiUrl + endpoint, params, {withCredentials: true})
                    .then(function(response) {
                        if(response.status != 200) {
                            return $q.reject(response.statusText);
                        }
                        if(response.data.ok) {
                            return response.data;
                        }
                        console.error(response.data.error, response);
                        return $q.reject(response.data.error);
                    }, errorHandler);
            },

            get(endpoint, params) {
                var $http = $injector.get('$http');
                return $http({method: 'GET', url: options.apiUrl + endpoint, params: params, withCredentials: true})
                    .then(function(response) {
                        if(response.data.ok) {
                            return response.data;
                        }
                        alert('Произошла ошибка: '+response.data.error);
                        return $q.reject(response.data.error);
                    }, errorHandler);
            }
        }

    };

});