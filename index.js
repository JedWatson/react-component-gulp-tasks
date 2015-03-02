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
 * This package exports a function that binds tasks to a gulp instance
 * based on the provided config.
 */

module.exports = function(gulp, config) {

	require('./tasks/bump')(gulp, config);
	require('./tasks/dev')(gulp, config);
	require('./tasks/dist')(gulp, config);
	require('./tasks/examples')(gulp, config);
	require('./tasks/lib')(gulp, config);
	require('./tasks/release')(gulp, config);

	gulp.task('build', [
		'build:lib',
		'build:dist',
		'build:examples'
	]);

}
