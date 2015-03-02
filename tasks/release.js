var git = require("gulp-git");

module.exports = function(gulp) {

	gulp.task('publish:tag', function(done) {
		var pkg = require('./package.json');
		var v = 'v' + pkg.version;
		var message = 'Release ' + v;

		git.tag(v, message, function (err) {
			if (err) throw err;
			git.push('origin', v, function (err) {
				if (err) throw err;
				done();
			});
		});
	});

	gulp.task('publish:npm', function(done) {
		require('child_process')
			.spawn('npm', ['publish'], { stdio: 'inherit' })
			.on('close', done);
	});

	gulp.task('publish:examples', ['build:examples'], function() {
		return gulp.src(config.example.dist + '/**/*').pipe(deploy());
	});
	
	gulp.task('release', ['publish:tag', 'publish:npm', 'publish:examples']);

};
