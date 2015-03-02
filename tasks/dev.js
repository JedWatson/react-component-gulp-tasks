var connect = require('gulp-connect');

module.exports = function(gulp, config) {

	gulp.task('dev:server', function() {
		connect.server({
			root: config.example.dist,
			port: 8000,
			livereload: true
		});
	});

	gulp.task('dev', [
		'dev:server',
		'watch:examples'
	]);

}
