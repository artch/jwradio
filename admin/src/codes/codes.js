var mod = angular.module('app.codes', []);

mod.config(function ($routeSegmentProvider) {
    $routeSegmentProvider
        .within('top').segment('codes', {
            templateUrl: 'codes/codes.html',
            controller: 'Codes as Codes'
        });

    $routeSegmentProvider.when('/codes', 'top.codes.list')
        .within('top').within('codes').segment('list', {
            templateUrl: 'codes/codes-list.html',
            controller: 'CodesList as CodesList'
        })

    $routeSegmentProvider.when('/codes/check', 'top.codes.check')
        .within('top').within('codes').segment('check', {
        templateUrl: 'codes/codes-check.html',
        controller: 'CodesCheck as CodesCheck'
    })

    $routeSegmentProvider.when('/codes/add', 'top.codes.add')
        .within('top').within('codes').segment('add', {
        templateUrl: 'codes/codes-add.html',
        controller: 'CodesAdd as CodesAdd'
    })

    $routeSegmentProvider.when('/codes/generation/:generation', 'top.codes.generation')
        .within('top').within('codes').segment('generation', {
        templateUrl: 'codes/codes-generation.html',
        controller: 'CodesGeneration as CodesGeneration',
        dependencies: ['generation']
    });
});

mod.controller('Codes', function (Api, $location) {

});

mod.controller('CodesList', function (Api, $location) {
    Api.get('admin/codes/list').then((data) => {
        this.list = data.list;
    })
});

mod.controller('CodesGeneration', function (Api, $location, $routeSegment) {
    this.exportLink = Api.options.apiUrl+'admin/codes/export?id='+$routeSegment.$routeParams.generation;

    Api.get('admin/codes/generation', {id: $routeSegment.$routeParams.generation}).then((data) => {
        this.info = data.info;
        this.codes = data.codes;
    })

    this.delete = () => {
        if(confirm('Вы действительно хотите удалить все коды из этого списка?')) {
            Api.post('admin/codes/delete-generation', {id: $routeSegment.$routeParams.generation})
                .then(() => $location.url('/codes'));
        }
    }
});


mod.controller('CodesCheck', function (Api, $location) {
    this.submit = () => {
        Api.post('admin/codes/check', {code: this.code})
            .then(result => {
                this.result = result;
                this.error = false;
            })
            .catch(() => this.error = true);
    };

    this.delete = () => {
        if(confirm('Вы действительно хотите удалить код '+this.result.code.code+'?')) {
            Api.post('admin/codes/delete-code', {code: this.result.code.code})
                .then(() => {
                    this.result = null;
                    this.code = '';
                })
        }

    }
});

mod.controller('CodesAdd', function (Api, $location) {
    this.form = {
        duration: 1,
        count: 500
    };

    this.submit = () => {
        Api.post('admin/codes/add', this.form)
            .then(result => {
                $location.url('/codes/generation/'+result.id);
            })
            .catch((error) => {
                alert('Произошла ошибка: '+error);
            })
    }
});
