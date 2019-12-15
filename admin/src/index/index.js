var mod = angular.module('app.index', []);

mod.config(function ($routeSegmentProvider) {
    $routeSegmentProvider.when('/', 'top.index')
        .within('top').segment('index', {
        templateUrl: 'index/index.html',
        controller: 'Index as Index'
    })
});

mod.controller('Index', function (Api, $location) {
    Api.get('admin/channels')
        .then(result => {
            this.channels = result.channels;
            result.channels[0].active = true;
            this.broadcastPort = result.broadcastPort;
            this.listenerPort = result.listenerPort;
            this.sourcePassword = result.sourcePassword;
            this.channels.forEach(i => i.updated && (i.updated = new Date(i.updated)));
        });

    this.selectChannel = (channel) => {
        this.channels.forEach(i => i.active = false);
        channel.active = true;
    }

    this.getTotalListeners = (channel) => {
        var sum = 0;
        channel._listeners.forEach(i => sum += (i.code && i.code.listeners || 1));
        return sum;
    }

    this.now = Date.now();
});