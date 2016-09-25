module.exports = {

	options: {
		banner: '<%= banner %>'
	},
	js: {
		src: "<%= pkg.config.dist %>/_js/<%= pkg.name %>.js",
		dest: "<%= pkg.config.dist %>/_js/<%= pkg.name %>.min.js"
	},
	pkgd: {
		src: "<%= pkg.config.dist %>/_js/<%= pkg.name %>.pkgd.js",
		dest: "<%= pkg.config.dist %>/_js/<%= pkg.name %>.pkgd.min.js"
	}
};
