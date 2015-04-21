var aliasify = require('aliasify');
var browserify = require('browserify');
var shim = require('browserify-shim');
var babelify = require('babelify');
var chalk = require('chalk');
var del = require('del');
var connect = require('gulp-connect');
var less = require('gulp-less');
var gutil = require('gulp-util');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

module.exports = function(gulp, config) {

	var doBundle = function(target, name, dest) {
		return target.bundle()
			.on('error', function(e) {
				gutil.log('Browserify Error', e);
			})
			.pipe(source(name))
			.pipe(gulp.dest(dest))
			.pipe(connect.reload());
	}

	var watchBundle = function(target, name, dest) {
		return watchify(target)
			.on('update', function (scriptIds) {
				scriptIds = scriptIds
					.filter(function(i) { return i.substr(0,2) !== './' })
					.map(function(i) { return chalk.blue(i.replace(__dirname, '')) });
				if (scriptIds.length > 1) {
					gutil.log(scriptIds.length + ' Scripts updated:\n* ' + scriptIds.join('\n* ') + '\nrebuilding...');
				} else {
					gutil.log(scriptIds[0] + ' updated, rebuilding...');
				}
				doBundle(target, name, dest);
			})
			.on('time', function (time) {
				gutil.log(chalk.green(name + ' built in ' + (Math.round(time / 10) / 100) + 's'));
			});
	}

	function buildExampleScripts(dev) {

		var dest = config.example.dist;

		var opts = dev ? watchify.args : {};
		opts.debug = dev ? true : false;
		opts.hasExports = true;

		return function() {

			var common = browserify(opts);
			
			var bundle = browserify(opts);
			bundle.transform(babelify.configure({
				plugins: ['object-assign']
			}));
			config.aliasify && bundle.transform(aliasify);
			bundle.require('./' + config.component.src + '/' + config.component.file, { expose: config.component.pkgName });
			
			var standalone = browserify('./' + config.component.src + '/' + config.component.file, { standalone: config.component.name });
			standalone.transform(babelify.configure({
				plugins: ['object-assign']
			}));
			config.aliasify && standalone.transform(aliasify);
			standalone.transform(shim);

			var examples = config.example.scripts.map(function(file) {
				var fileBundle = browserify(opts);
				fileBundle.exclude(config.component.pkgName);
				fileBundle.add('./' + config.example.src + '/' + file);
				fileBundle.transform(babelify.configure({
					plugins: ['object-assign']
				}));
				config.aliasify && fileBundle.transform(aliasify);
				return {
					file: file,
					bundle: fileBundle
				};
			});

			config.component.dependencies.forEach(function(pkg) {
				common.require(pkg);
				bundle.exclude(pkg);
				standalone.exclude(pkg);
				examples.forEach(function(eg) {
					eg.bundle.exclude(pkg);
				});
			});

			if (dev) {
				watchBundle(common, 'common.js', dest);
				watchBundle(bundle, 'bundle.js', dest);
				watchBundle(standalone, 'standalone.js', dest);
				examples.forEach(function(eg) {
					watchBundle(eg.bundle, eg.file, dest);
				});
			}

			return merge([
				doBundle(common, 'common.js', dest),
				doBundle(bundle, 'bundle.js', dest),
				doBundle(standalone, 'standalone.js', dest)
			].concat(examples.map(function(eg) {
				return doBundle(eg.bundle, eg.file, dest);
			})));

		}

	};

	gulp.task('clean:examples', function(done) {
		del([config.example.dist], done);
	});

	gulp.task('watch:example:scripts', buildExampleScripts(true));
	gulp.task('build:example:scripts', buildExampleScripts());

	gulp.task('build:example:files', function() {
		return gulp.src(config.example.files.map(function(i) { return config.example.src + '/' + i }))
			.pipe(gulp.dest(config.example.dist))
			.pipe(connect.reload());
	});

	gulp.task('build:example:css', function() {
		return gulp.src(config.example.src + '/' + config.example.less)
			.pipe(less())
			.pipe(gulp.dest(config.example.dist))
			.pipe(connect.reload());
	});
	
	gulp.task('build:examples', [
		'build:example:files',
		'build:example:css',
		'build:example:scripts'
	]);

	gulp.task('watch:examples', [
		'build:example:files',
		'build:example:css',
		'watch:example:scripts'
	], function() {
		gulp.watch(config.example.files.map(function(i) { return config.example.src + '/' + i }), ['build:example:files']);
		gulp.watch([config.example.src + './' + config.example.less], ['build:example:css']);
	});
	
}
