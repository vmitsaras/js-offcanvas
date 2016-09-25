module.exports = {
	options: {
		branch: "gh-pages",
		tag: "v<%= pkg.version %>",
		message: "<%= pkg.version %> [ci skip]"
	},
	src: [
		"<%= pkg.config.dist %>/**/*",
		"<%= pkg.config.demo %>/**/*"
	]
};
