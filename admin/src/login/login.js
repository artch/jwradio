var mod = angular.module('app.login', []);

mod.config(function($routeSegmentProvider) {
    $routeSegmentProvider
        .when('/login', 'login')
        .segment('login', {
            templateUrl: 'login/login.html',
            controller: 'Login as Login'
        });
});

mod.controller('Login', function(Api, $location) {
   this.submit = () => {
       Api.post('auth/login', {login: this.login, password: this.password})
           .then(() => {
               $location.url('/');
               this.error = false;
           })
           .catch(() => {
               this.error = true;
           });
   }
});