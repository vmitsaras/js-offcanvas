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
			"node_modules/js-utilities/utils.js",
			"node_modules/js-trap-tab/trap-tab.js",
			"node_modules/js-button/dist/_js/js-button.js",
			"src/<%= pkg.name %>.js",
			"src/<%= pkg.name %>-init.js",
			"src/<%= pkg.name %>-trigger.js",
			"src/<%= pkg.name %>-trigger-init.js"
		]
	}
};
