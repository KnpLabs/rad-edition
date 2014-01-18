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
        app: {
            name: '<%= composer.name %>',
            src: 'src/App/Resources/front',
            web: '<%= composer.extra["symfony-web-dir"] %>',
            app: '<%= app.web %>/front',
            build: '<%= app.web %>/dist',
            views: 'src/App/Resources/views'
        },

        // configure the jshint tasks
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            scripts: {
                options: {
                    jshintrc: '<%= app.src %>/.jshintrc'
                },
                src: ['<%= app.src %>/scripts/{,*/}*.js']
            },
            test: {
                options: {
                    jshintrc: '<%= app.src %>/test/.jshintrc'
                },
                src: ['<%= app.src %>/test/{,*/}*.js']
            },
        },

        // configure use min
        useminPrepare: {
            html: '<%= app.views %>/layout.dev.html.twig',
            options: {
                root: '<%= app.web %>',
                dest: '<%= app.build %>',
                staging: '<%= app.app %>/.tmp'
            },
        },
        usemin: {
            html: ['<%= app.app %>/layout.prod.html.twig'],
            options: {
                assetsDirs: ['<%= app.build %>']
            }
        },

        // configure compass
        compass: {
            options: {
                sassDir: '<%= app.app %>/styles',
                cssDir: '<%= app.app %>/styles',
                generatedImagesDir: '<%= app.app %>/images/generated',
                imagesDir: '<%= app.app %>/images',
                javascriptsDir: '<%= app.app %>/scripts',
                fontsDir: '<%= app.app %>/styles/fonts',
                importPath: '<%= app.app %>/bower_components',
                httpImagesPath: '/front/images',
                httpGeneratedImagesPath: '/front/images/generated',
                httpFontsPath: '/front/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= app.dist %>/images/generated'
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
                    dot: true,
                    cwd: '<%= app.src %>',
                    dest: '<%= app.app %>',
                    src: ['{,*/}*']
                }]
            },
            layoutApp: {
                src: '<%= app.views %>/layout.dev.html.twig',
                dest: '<%= app.app %>/layout.prod.html.twig'
            },
            layoutDist: {
                src: '<%= app.app %>/layout.prod.html.twig',
                dest: '<%= app.views %>/layout.prod.html.twig'
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= app.build %>/front',
                    dest: '<%= app.web %>/front',
                    src: ['{,*/}*']
                }]
            }
        },

        // configure clean app
        clean: {
            app: ['<%= app.app %>'],
            build: ['<%= app.build %>'],
            scss: ['<%= app.app %>/styles/{,*/}*.{scss,sass}', '.sass-cache'],
        },

        // rename distribution files for browser cache supports
        rev: {
            build: {
                files: {
                    src: [
                        '<%= app.build %>/**/scripts/{,*/}*.js',
                        '<%= app.build %>/**/styles/{,*/}*.css',
                        '<%= app.build %>/**/images/{,*/}*.{gif,jpeg,jpg,png,webp}',
                        '<%= app.build %>/**/styles/fonts/{,*/}*.*'
                    ]
                }
            }
        },

        // automtically insert bower dependencies in html layout
        'bower-install': {
            app: {
                src: ['<%= app.views %>/layout.dev.html.twig'],
                ignorePath: '<%= app.web %>',
                fileTypes: {
                    twig: {
                        block: /(([\s\t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
                        detect: {
                            js: /<script.*src=['"](.+)['"]>/gi,
                            css: /<link.*href=['"](.+)['"]/gi
                        },
                        replace: {
                            js: '<script src="{{filePath}}"></script>',
                            css: '<link rel="stylesheet" href="{{filePath}}" />'
                        }
                    }
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
                files: '<%= app.src %>/scripts/{,*/}*.js',
                tasks: ['install', 'jshint:scripts']
            },
            styles: {
                files: '<%= app.src %>/styles/{,*/}*.{css,sass,scss}',
                tasks: ['install']
            },
            bower: {
                files: 'bower.json',
                tasks: ['install']
            }
        }
    });

    grunt.registerTask('build', [
        'clean:build',
        'install',
        'copy:layoutApp',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'rev',
        'usemin',
        'copy:layoutDist',
        'clean:app',
        'copy:dist',
        'clean:build'
    ]);

    grunt.registerTask('install', [
        'clean:app',
        'copy:app',
        'bower',
        'bower-install',
        'compass:server',
        'clean:scss'
    ]);

    grunt.registerTask('serve', [
        'install',
        'watch'
    ]);
};
