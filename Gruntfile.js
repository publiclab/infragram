module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-babel');

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),

      watch: {
          options : {
              livereload: true
          },
          source: {
              files: [
                  'src/*.js',
                  'src/*/*.js',
                  'Gruntfile.js'
              ],
              tasks: [ 'build:js' ]
          }
      },


      babel: {
        options: {
          sourceMap: true,
          presets: ['env']
        },
        dist: {
          files: {
            'dist/infragram.js': 'dist/infragram.js'
          }
        }
      },

      browserify: {
          dist: {
            src: ['src/Infragram.js'],
            dest: 'dist/infragram.js'
          }
      },

      uglify: {
        dist: {
          src: ['./dist/infragram.js'],
          dest: './dist/infragram.min.js'
        }
      }

    });

    /* Default (development): Watch files and build on change. */
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', [
        'browserify:dist',
        'babel:dist',
        'uglify:dist'
    ]);

};
