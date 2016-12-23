module.exports = function(grunt) {

    var TEMPLATES_LOCATION        = "./src/hbs/",       // don't forget the trailing /
        TEMPLATES_EXTENSION       = ".hbs",
        TEMPLATES_OUTPUT_LOCATION = "./public/js/",       // don't forget the trailing /
        TEMPLATES_OUTPUT_FILENAME = "templates.min.js",  // don't forget the .js
        LESS_LOCATION = "./src/less/"

    grunt.initConfig({
        watch: {
            handlebars: {
                files: [TEMPLATES_LOCATION + '**/*' + TEMPLATES_EXTENSION],
                tasks: ['handlebars:compile'],
                options: {
                    livereload: true
                }
            },
            less: {
                files: [LESS_LOCATION + '**/*' + '.less'],
                tasks: ['less:compile'],
                options: {
                    livereload: true
                }
            }
        },
        handlebars: {
            compile: {
                src: TEMPLATES_LOCATION + '**/*' + TEMPLATES_EXTENSION,
                dest: TEMPLATES_OUTPUT_LOCATION + TEMPLATES_OUTPUT_FILENAME,
                options: {
                    namespace: 'Handlebars.templates',
                    processName: function(filePath) {
                        var pieces = filePath.split("/");
                        var last = pieces[pieces.length - 1];
                        return last.replace(".hbs", "")
                    }
                }
            }
        },
        less: {
            compile: {
                options: {
                    paths: function(sourceDir) {
                        return [sourceDir, './bower_components/bootstrap/less/', './bower_components/flag-icon-css/less/', './bower_components/font-awesome/less/']
                    },
                    compress: true,

                },
                files: {
                    "./public/css/style.min.css": "./src/less/style.less"
                }
            }
        },
        copy: {
            all: {
                files: [
                    // copy js files
                    { flatten: true, expand: true, src: ['bower_components/jquery/dist/jquery.min.js', 'bower_components/jquery/dist/jquery.min.map', 'bower_components/bootstrap/dist/js/bootstrap.min.js', 'bower_components/handlebars/handlebars.runtime.min.js', 'bower_components/nprogress/nprogress.js', 'src/js/main.js'], dest: 'public/js/' },
                    // copy css
                    { flatten: true, expand: true, src: ['bower_components/nprogress/nprogress.css'], dest: 'public/css/' },
                    // copy flag images
                    { flatten: true, expand: true, src: ['bower_components/flag-icon-css/flags/1x1/*'], dest: 'public/flags/1x1/' },
                    { flatten: true, expand: true, src: ['bower_components/flag-icon-css/flags/4x3/*'], dest: 'public/flags/4x3/'},
                    // copy fonts
                    { flatten: true, expand: true, src: ['bower_components/font-awesome/fonts/*'], dest: 'public/fonts/'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.task.registerTask('default', ['copy', 'handlebars']);
}
