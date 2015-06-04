var defaults = require('defaults')
var capitalize = require('capitalize')
var camelCase = require('camelcase')

/**
 * Helper method to extract metadata from package.json
 */

function readPackageJSON() {
	var pkg = JSON.parse(require('fs').readFileSync('./package.json'));
	var deps = [];
	if (pkg.dependencies) {
		Object.keys(pkg.dependencies).forEach(function(i) {
			deps.push(i);
		});
	}
	if (pkg.peerDependencies) {
		Object.keys(pkg.peerDependencies).forEach(function(i) {
			deps.push(i);
		});
	}
	return {
		name: pkg.name,
		deps: deps,
		aliasify: pkg.aliasify
	};
}

/**
 * This package exports a function that binds tasks to a gulp instance
 * based on the provided config.
 */

function initTasks(gulp, config) {

	var pkg = readPackageJSON();

	if (!config) config = {};
	if (!config.component) config.component = {};

	if (!config.component.pkgName || !config.component.deps) {
		defaults(config.component, {
			pkgName: pkg.name,
			dependencies: pkg.deps
		});
	}

	if (!config.component.name) {
		config.component.name = capitalize(camelCase(config.component.pkgName));
	}

	if (!config.aliasify) {
		config.aliasify = pkg.aliasify;
	}

	defaults(config.component, {
		src: 'src',
		lib: 'lib',
		dist: 'dist',
		file: config.component.name + '.js'
	});

	if (config.example) {
		if (config.example === true) config.example = {};
		defaults(config.example, {
			src: 'example/src',
			dist: 'example/dist',
			files: [
				'index.html'
			],
			scripts: [
				'example.js'
			],
			less: [
				'example.less'
			]
		});
	}

	require('./tasks/bump')(gulp, config);
	require('./tasks/dev')(gulp, config);
	require('./tasks/dist')(gulp, config);
	require('./tasks/release')(gulp, config);

	var buildTasks = ['build:dist'];
	var cleanTasks = ['clean:dist'];

	if (config.component.lib) {
		require('./tasks/lib')(gulp, config);
		buildTasks.push('build:lib');
		cleanTasks.push('clean:lib');
	}

	if (config.example) {
		require('./tasks/examples')(gulp, config);
		buildTasks.push('build:examples');
		cleanTasks.push('clean:examples');
	}

	gulp.task('build', buildTasks);
	gulp.task('clean', cleanTasks);

}

module.exports = initTasks;
module.exports.readPackageJSON = readPackageJSON;
