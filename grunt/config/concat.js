module.exports = {
	js: {
		src: [
			"src/<%= pkg.name %>.js",
			"src/<%= pkg.name %>-init.js",
			"src/<%= pkg.name %>-trigger.js",
			"src/<%= pkg.name %>-trigger-init.js"
		]
	},
	pkgd: {
		src: [
			"bower_components/js-utilities/utils.js",
			"bower_components/js-trap-tab/trap-tab.js",
			"bower_components/js-button/dist/_js/js-button.js",
			"src/<%= pkg.name %>.js",
			"src/<%= pkg.name %>-init.js",
			"src/<%= pkg.name %>-trigger.js",
			"src/<%= pkg.name %>-trigger-init.js"
		]
	}
};
