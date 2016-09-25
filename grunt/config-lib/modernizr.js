module.exports = {
	dist: {
		"crawl": false,
		"cache" : false,
		"dest": "vendor/modernizr.js",
		"classPrefix": "support-",
		"tests": [
			"touchevents",
			"cssanimations",
			"flexbox",
			"csstransforms",
			"csstransforms3d",
			"csstransitions"
		],
		"options": [
			"domPrefixes",
			"prefixes",
			"addTest",
			"hasEvent",
			"mq",
			"prefixed",
			"testAllProps",
			"testProp",
			"testStyles",
			"html5shiv",
			"setClasses"
		],
		"uglify": false
	}
};
