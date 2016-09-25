module.exports = {
	options: {
		stripBanners: true
	},
	js: {
		src: [],
		dest: "<%= pkg.config.dist %>/_js/<%= pkg.name %>.js"
	},
	pkgd: {
		src: [],
		dest: "<%= pkg.config.dist %>/_js/<%= pkg.name %>.pkgd.js"
	}
};
