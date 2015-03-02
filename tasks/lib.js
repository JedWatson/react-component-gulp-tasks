var babel = require('gulp-babel'),
	del = require('del')

module.exports = function(gulp, config) {

	gulp.task('clean:lib', function(done) {
		del([config.component.lib], done);
	});

	gulp.task('build:lib', ['clean:lib'], function() {
		return gulp.src(config.component.src + '/**/*.js')
			.pipe(babel())
			.pipe(gulp.dest(config.component.lib));
	});

}
