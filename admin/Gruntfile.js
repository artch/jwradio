const sass = require('node-sass');

module.exports = function(grunt) {

    grunt.initConfig({
        copy: {
            vendor: {
                files: [
                    {cwd: 'node_modules/angular', src: 'angular.min.js', dest: 'dist/vendor', expand: true},
                    {cwd: 'node_modules/angular-route', src: 'angular-route.min.js', dest: 'dist/vendor', expand: true},
                    {cwd: 'node_modules/angular-i18n', src: 'angular-locale_ru-ru.js', dest: 'dist/vendor', expand: true},
                    {cwd: 'node_modules/bootstrap/dist/js', src: 'bootstrap.js', dest: 'dist/vendor', expand: true},
                    {cwd: 'node_modules/angular-route-segment/build', src: 'angular-route-segment.min.js', dest: 'dist/vendor', expand: true}
                ]
            }
        },
        concat: {
            options: {
                separator: ';\n'
            },
            src: {
                src: ['src/**/*.js', '!src/config.example.js'],
                dest: 'dist/build.js'
            }
        },
        pug: {
            options: {
                pretty: true
            },
            src: {
                cwd: 'src',
                src: '**/*.pug',
                dest: 'dist',
                ext: '.html',
                expand: true
            }
        },
        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            src: {
                files: {
                    'dist/main.css': 'src/main.scss'
                }
            }
        },
        watch: {
            all: {
                files: ['src/**/*'],
                tasks: ['default']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['copy', 'concat', 'pug', 'sass']);

};