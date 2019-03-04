var mod = angular.module('app.settings', []);

mod.config(function ($routeSegmentProvider) {
    $routeSegmentProvider.when('/settings', 'top.settings')
        .within('top').segment('settings', {
            templateUrl: 'settings/settings.html',
            controller: 'Settings as Settings'
        })
});
mod.controller('Settings', function (Api, $location) {

});


mod.controller('SettingsChangePassword', function (Api, $q) {
    this.form = {};

    this.submit = () => {
        Api.post('admin/change-password', this.form)
            .then((result) => {
                if(result.invalid) {
                    return $q.reject(result.invalid);
                }
                this.success = true;
                this.error = false;
            })
            .catch((error) => {
                this.success = false;
                this.error = error;
            });
    }
});