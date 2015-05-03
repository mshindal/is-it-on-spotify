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
                        return [sourceDir, './bower_components/bootstrap/less/', './bower_components/flag-icon-css/less/']
                    },
                    compress: true,

                },
                files: {
                    "./public/css/style.min.css": "./src/less/style.less"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');

}