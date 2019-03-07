const sass = require('node-sass');

module.exports = function(grunt) {

    grunt.initConfig({
        copy: {
            src: {
                files: [
                    {cwd: 'src', src: ['**/*','!**/*.pug','!**/*.scss'], dest: 'dist', expand: true}
                ]
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
                    'dist/style.css': 'src/style.scss'
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

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['copy', 'pug', 'sass']);

};