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
            views: 'src/App/Resources/views',
            layout: '<%= paths.src %>/layout.html.twig'
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
            spec: {
                options: {
                    jshintrc: '<%= paths.src %>/spec/.jshintrc'
                },
                src: ['<%= paths.src %>/spec/{,*/}*.js']
            },
        },

        // configure use min
        useminPrepare: {
            html: '<%= paths.layout %>',
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
                    src: ['{,*/}*', '!layout.html.twig', '!styles/**/*.scss', '!styles/**/*.sass', '!spec']
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
                        '!spec'
                    ]
                }]
            },
            layoutApp: {
                src: '<%= paths.layout %>',
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

        // configure the karma runner
        karma: {
            spec: {
                options: {},
                configFile: 'karma.conf.js'
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
            spec: {
                files: '<%= paths.src %>/test/spec/**/*.js',
                tasks: ['karma']
            },
            bower: {
                files: 'bower.json',
                tasks: ['install']
            }
        }
    });

    // defined the karma runner testfiles :
    grunt.config.set('karma.spec.options.files', (function () {
        var fs         = require('fs');
        var bowerrc    = JSON.parse(fs.readFileSync('.bowerrc', 'utf8'));
        var testPath   = grunt.config.get('paths.src') + '/test';
        var vendorPath = bowerrc.directory;
        var sourcePath = grunt.config.get('paths.src') + '/scripts';

        return [
            // load vendors here :
            vendorPath + '/jquery/jquery.js',

            // load your source files that you wan't to test
            sourcePath + '/**/*.js',

            // Here you can defined mocks if you need it
            testPath + '/mock/**/*.js',

            // load the specs
            testPath + '/spec/**/*.js'
        ];
    })());

    // configure the preprocessor fixtures path for karma :
    grunt.config.set('karma.spec.options.preprocessors', (function () {
        var testPath   = grunt.config.get('paths.src') + '/test';
        var fixtures   = testPath  + '/fixtures/**/*.html';
        var processors = {};
        processors[fixtures] = ['html2js'];

        return processors;
    })());

    grunt.registerTask('test', [
        'karma'
    ]);

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
        'usemin'
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

    grunt.registerTask('server', ['serve']);
};
