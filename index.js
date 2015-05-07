var _ = require('lodash');

/**
 * Check that a compatible version of gulp is available in the project
 */

function fatal() {
	var msg = '\n\n';
	for (var i = 0; i < arguments.length; i++) {
		msg += arguments[i] + '\n\n';
	}
	console.log(msg);
	process.exit(1);
}

try {
	var projectGulpVersion = require(module.parent.paths[0] + '/gulp/package.json').version;
} catch(e) {
	// If we can't find gulp in the parent project, it's a fatal problem.
	fatal(
		'You do not seem to have Gulp installed in your project.',
		'Please add gulp ^' + packageGulpVersion + ' to your package.json, npm install and try again.'
	);
}
try {
	// Check to make sure the local gulp and the project gulp match.
	var packageGulpVersion = require('./node_modules/gulp/package.json').version;
	if (!semver.satisfies(projectGulpVersion, '^' + packageGulpVersion)) {
		fatal(
			'You have an incompatible version of Gulp installed (' + projectGulpVersion + ').',
			'Please add gulp ^' + packageGulpVersion + ' to your package.json, npm install and try again.'
		);
	}
} catch(e) {
	// Assume gulp has been loaded from ../node_modules and it matches the requirements.
}

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
		_.defaults(config.component, {
			pkgName: pkg.name,
			dependencies: pkg.deps
		});
	}

	if (!config.component.name) {
		config.component.name = _.capitalize(_.camelCase(config.component.pkgName));
	}
	
	if (!config.aliasify) {
		config.aliasify = pkg.aliasify;
	}

	_.defaults(config.component, {
		src: 'src',
		lib: 'lib',
		dist: 'dist',
		file: config.component.name + '.js'
	});

	if (config.example) {
		if (config.example === true) config.example = {};
		_.defaults(config.example, {
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
