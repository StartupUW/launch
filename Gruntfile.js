module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'lib/build/js/*.js'],
      options: {
        globals: { jQuery: true }
      }
    },
    uglify: {
      build: {
        files: [{ 
          expand: true,
          cwd: 'src/build/js',
          src: '*.js',
          dest: 'src/public/js',
          ext: '.min.js'
        }]
      }
    },
    react: {
        files: {
            expand: true,
            cwd: 'src/build/jsx',
            src: ['*.jsx'],
            dest: 'src/build/js',
            ext: '.js'
        }
    },
    watch: {
      js: {
        files: ['src/build/js/*.js'],
        tasks: ['jshint', 'uglify']
      },
      react: {
        files: ['src/build/jsx/*.jsx'],
        tasks: ['react', 'jshint', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');

  grunt.registerTask('default', ['react', 'jshint', 'uglify']);

};
