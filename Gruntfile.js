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
            layouts: '<%= paths.src %>/layouts'
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
                    jshintrc: '<%= paths.src %>/test/.jshintrc'
                },
                src: ['<%= paths.src %>/test/{,*/}*.js']
            },
        },

        // configure use min
        useminPrepare: {
            html: [],
            options: {
                root: '<%= paths.web %>',
                dest: '<%= paths.web %>',
                staging: '<%= paths.tmp %>'
            }
        },
        usemin: {
            html: [],
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

        // configure grunt symlink
        symlink: {
            options: {
                overwrite: false
            },
            app: {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.src %>',
                    dest: '<%= paths.app %>',
                    src: ['*', '!layouts', '!styles/**/*.scss', '!styles/**/*.sass', '!test']
                }]
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
        },

        copy: {
            build: {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.src %>',
                    dest: '<%= paths.build %>',
                    src: [
                        '*',
                        '!layouts',
                        '!styles',
                        '!scripts',
                        '!images',
                        '!test'
                    ]
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
            },
            layoutApp: {
                files: [{
                    expand: true,
                    dot: false,
                    cwd: '<%= paths.layouts %>',
                    dest: '<%= paths.views %>/layouts',
                    src: ['*.twig']
                }]
            }
        },

        // configure clean app
        clean: {
            app: ['<%= paths.app %>'],
            'styles-build': ['<%= paths.build %>/styles/**/*.css', '!<%= paths.build %>/styles/app.css', '!<%= paths.build %>/styles/vendor.css']
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
                tasks: ['jshint:spec', 'karma']
            },
            bower: {
                files: 'bower.json',
                tasks: ['install']
            },
            layout: {
                files: '<%= paths.src %>/layouts/*.twig',
                tasks: ['install']
            }
        }
    });

    // defined the karma runner test files :
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

    // set the usemin preparation layouts
    grunt.config.set('useminPrepare.html', (function () {
        var fs = require('fs');
        var layouts = fs.readdirSync(grunt.config.get('paths.layouts'));
        for (var i in layouts) {
            layouts[i] = '<%= paths.layouts %>/' + layouts[i];
        }

        return layouts;
    })());

    // set the usemin html layouts destination
    grunt.config.set('usemin.html', (function () {
        var fs = require('fs');
        var layouts = fs.readdirSync(grunt.config.get('paths.layouts'));
        for (var i in layouts) {
            layouts[i] = '<%= paths.views %>/layouts/' + layouts[i];
        }

        return layouts;
    })());

    grunt.registerTask('test', [
        'jshint',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:app',
        'copy:layoutApp',
        'bower',
        'copy:build',
        'compass:dist',
        'copy:styles-build',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'clean:styles-build',
        'usemin'
    ]);

    grunt.registerTask('install', [
        'clean:app',
        'symlink:app',
        'bower',
        'compass:server',
        'symlink:styles',
        'copy:layoutApp'
    ]);

    grunt.registerTask('serve', [
        'install',
        'watch'
    ]);

    grunt.registerTask('server', ['serve']);
};
