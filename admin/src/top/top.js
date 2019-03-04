var mod = angular.module('app.top', []);

mod.config(function ($routeSegmentProvider) {
    $routeSegmentProvider
        .segment('top', {
            templateUrl: 'top/top.html',
            controller: 'Top as Top'
        })
});

mod.controller('Top', function (Api, $location) {
    Api.get('auth/me')
        .then(data => {
            this.auth = data.user;
        })

    this.logout = function() {
        Api.post('auth/logout')
            .then(() => $location.url('/login'));
    }
});