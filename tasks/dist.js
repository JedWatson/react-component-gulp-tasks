var del = require('del');
var browserify = require('browserify');
var babelify = require('babelify');
var shim = require('browserify-shim');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

module.exports = function(gulp, config) {

	gulp.task('clean:dist', function(done) {
		del([config.component.dist], done);
	});

	gulp.task('build:dist', ['clean:dist'], function() {

		var standalone = browserify('./' + config.component.src + '/' + config.component.file, {
				standalone: config.component.name
			})
			.transform(babelify)
			.transform(shim);

		config.component.dependencies.forEach(function(pkg) {
			standalone.exclude(pkg);
		});

		return standalone.bundle()
			.on('error', function(e) {
				gutil.log('Browserify Error', e);
			})
			.pipe(source(config.component.pkgName + '.js'))
			.pipe(gulp.dest(config.component.dist))
			.pipe(rename(config.component.pkgName + '.min.js'))
			.pipe(streamify(uglify()))
			.pipe(gulp.dest(config.component.dist));

	});

}
