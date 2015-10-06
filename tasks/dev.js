var connect = require('gulp-connect');
var path = require('path');

module.exports = function (gulp, config) {
	gulp.task('dev:server', function () {
		connect.server({
			root: config.example.dist,
			fallback: path.join(config.example.dist, 'index.html'),
			port: config.example.port || process.env.PORT || 8000,
			livereload: true
		});
	});

	gulp.task('dev', ['dev:server', 'watch:examples']);
};
