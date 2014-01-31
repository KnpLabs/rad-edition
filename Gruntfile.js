'use strict';

module.exports = function (grunt) {

    // automitacly load grunt tasks
    require('load-grunt-tasks')(grunt);

    // mesure tasks times, can help ;)
    require('time-grunt')(grunt);

    // define your grunt configuration here
    grunt.initConfig({
        composer: grunt.file.readJSON('composer.json'),
        // defined grunt settings here, feel free to change
        // parameters here
        paths: {
            name: 'front',
            src: 'src/<%= paths.name %>',
            web: '<%= composer.extra["symfony-web-dir"] %>',
            app: '<%= paths.web %>/front',
            tmp: '<%= paths.src %>/.tmp',
            build: '<%= paths.web %>/front',
            views: 'src/App/Resources/views'
        },

        // configure the jshint tasks
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            scripts: {
                options: {
                    jshintrc: '<%= paths.src %>/.jshintrc'
                },
                src: ['<%= paths.src %>/scripts/{,*/}*.js']
            },
            test: {
                options: {
                    jshintrc: '<%= paths.src %>/test/.jshintrc'
                },
                src: ['<%= paths.src %>/test/{,*/}*.js']
            },
        },

        // configure use min
        useminPrepare: {
            html: '<%= paths.src %>/layout.html.twig',
            options: {
                root: '<%= paths.web %>',
                dest: '<%= paths.web %>',
                staging: '<%= paths.tmp %>'
            }
        },
        usemin: {
            html: ['<%= paths.views %>/layout.html.twig'],
            options: {
                assetsDirs: ['<%= paths.build %>']
            }
        },

        // configure compass
        compass: {
            options: {
                sassDir: '<%= paths.src %>/styles',
                cssDir: '<%= paths.tmp %>/styles',
                generatedImagesDir: '<%= paths.app %>/images/generated',
                imagesDir: '<%= paths.app %>/images',
                javascriptsDir: '<%= paths.app %>/scripts',
                fontsDir: '<%= paths.app %>/styles/fonts',
                importPath: '<%= paths.app %>/vendor',
                httpImagesPath: '/front/images',
                httpGeneratedImagesPath: '/front/images/generated',
                httpFontsPath: '/front/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= paths.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },

        // configure grunt copy
        copy: {
            app: {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.src %>',
                    dest: '<%= paths.app %>',
                    src: ['{,*/}*', '!layout.html.twig', '!styles/**/*.scss', '!styles/**/*.sass', '!test']
                }]
            },
            build: {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.src %>',
                    dest: '<%= paths.build %>',
                    src: [
                        '{,*/}*',
                        '!layout.html.twig',
                        '!styles/**/*',
                        '!scripts/**/*',
                        '!images/**/*',
                        '!test'
                    ]
                }]
            },
            layoutApp: {
                src: '<%= paths.src %>/layout.html.twig',
                dest: '<%= paths.views %>/layout.html.twig'
            },
            layoutDist: {
                src: '<%= paths.tmp %>/layout.html.twig',
                dest: '<%= paths.views %>/layout.html.twig'
            },
            styles: {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.tmp %>/styles',
                    dest: '<%= paths.app %>/styles',
                    src: ['**/*.css']
                }]
            },
            'styles-build': {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.tmp %>/styles',
                    dest: '<%= paths.build %>/styles',
                    src: ['**/*.css']
                }]
            }
        },

        // configure clean app
        clean: {
            app: ['<%= paths.app %>'],
            'styles-build': ['<%= paths.build %>/styles/**/*.css', '!<%= paths.build %>/styles/app.css', '!<%= paths.build %>/styles/vendor.css']
        },

        // rename distribution files for browser cache supports
        rev: {
            build: {
                files: {
                    src: [
                        '<%= paths.build %>/**/scripts/{,*/}*.js',
                        '<%= paths.build %>/**/styles/{,*/}*.css'
                    ]
                }
            }
        },

        // configure the bower
        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },

        // configure watcher
        watch: {
            js: {
                files: '<%= paths.src %>/scripts/{,*/}*.js',
                tasks: ['install', 'jshint:scripts']
            },
            styles: {
                files: '<%= paths.src %>/styles/{,*/}*.{css,sass,scss}',
                tasks: ['install']
            },
            bower: {
                files: 'bower.json',
                tasks: ['install']
            }
        }
    });

    grunt.registerTask('build', [
        'clean:app',
        'bower',
        'copy:build',
        'compass:dist',
        'copy:styles-build',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'clean:styles-build',
        'rev',
        'usemin',
        'copy:layoutDist'
    ]);

    grunt.registerTask('install', [
        'clean:app',
        'copy:app',
        'bower',
        'compass:server',
        'copy:styles',
        'copy:layoutApp'
    ]);

    grunt.registerTask('serve', [
        'install',
        'watch'
    ]);
};
