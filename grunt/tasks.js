module.exports = function(grunt) {
	"use strict";

	grunt.registerTask( "init", [ "mkdir" ] );

	grunt.registerTask( "default", [ "clean", "src", "uglify", "scss", "bytesize" ] );

	grunt.registerTask( "mdzr", [ "modernizr:dist" ] );
	grunt.registerTask( "lint", [ "jshint", "lintspaces" ] );
	grunt.registerTask( "src", [ "lint", "concat", "usebanner" ] );
	grunt.registerTask( "scss", [ "sass", "postcss", "cssmin" ] );
	grunt.registerTask( "test", [ "qunit" ] );

	grunt.registerTask( "deploy", [ "default", "gh-pages" ] );

};
