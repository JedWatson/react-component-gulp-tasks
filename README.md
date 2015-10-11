react-component-gulp-tasks
==========================

This package provides common gulp tasks for building react components with:

* Browserify for transforming JSX and creating distribution builds
* Watchify for automatic, efficient rebundling on file changes
* Connect for serving examples during development, with live-reload integration
* LESS stylesheets for examples
* Publishing examples to Github Pages
* Publishing packages to npm and bower

You control the settings for the tasks by providing a `config` object, as described below.


## Project setup

The tasks assume you are following the following conventions for your project:

* Package source has a single entry point in a source folder
* The package will be published to both npm and bower
* A transpiled version will be published to a lib folder (for Node.js, Browserify and Webpack)
* A standalone package will be published to a dist folder (for Bower)
* Examples consist of
	* Static file(s) (e.g. html, images, etc)
	* One or more stylesheets to be generated with LESS
	* One or more scripts to be bundled with Browserify
* Examples will be packaged into an examples dist folder, and published to github pages

### Example project structure

```
bower.json
package.json
gulpfile.js
src
	MyComponent.js
less
	my-component.less
lib
	// contains transpiled source
	MyComponent.js
dist
	// contains packaged component
    my-component.js
    my-component.min.js
    my-component.css
example
	dist
		// contains built examples
	src
		app.js
		app.less
		index.html
```

For a complete example see [JedWatson/react-component-starter](https://github.com/JedWatson/react-component-starter)


## Usage

```
npm install --save-dev gulp react-component-gulp-tasks
```

In your gulpfile, call this package with your `gulp` instance and `config`. It will add the tasks to gulp for you. You can also add your own tasks if you want.

```javascript
var gulp = require('gulp');
var initGulpTasks = require('react-component-gulp-tasks');
var taskConfig = require('./config');

initGulpTasks(gulp, taskConfig);
```

### Task Config

You can customise the tasks to match your project structure by changing the config.

Required config keys are:

**`Component`**

* `component.file` - the source (entry) file for the component
* `component.name` - controls the standalone module name
* `component.src` - the directory to load the source file from
* `component.dist` - the directory to build the distribution to
* `component.pkgName` - the name of the package that will be exported by the component (**must match the name of your package on npm**)
* `component.dependencies[]` - array of common dependencies that will be excluded from the build, and included in a common bundle for the examples
* `component.less.entry` - the entrypoint for the component stylesheet, if you're using less to provide one
* `component.less.path` - the path of the less files. everything with a .less extension in this directory will be watched in for changes in development

**`Example`**

* `example.src` - the directory to load the source files from
* `example.dist` - the directory to build the distribution to
* `example.files[]` - files will be copied as-is into the `example.dist` folder
* `example.scripts[]` - scripts will be transpiled with babel and bundled by browserify
* `example.less[]` - stylesheets will be generated with LESS
* `example.port` - port to serve examples on, defaults to `8000`

### Example

This is an example of the `config.js` file for the project structure above:

```javascript
var gulp = require('gulp');
var initGulpTasks = require('react-component-gulp-tasks');

var taskConfig = {

	component: {
		name: 'MyComponent',
		dependencies: [
			'blacklist',
			'classnames',
			'react',
			'react/addons'
		],
		less: {
			path: 'less',
			entry: 'my-component.less'
		}
	},

	example: {
		src: 'example/src',
		dist: 'example/dist',
		files: [
			'index.html'
		],
		scripts: [
			'app.js'
		],
		less: [
			'app.less'
		]
	}

};

initGulpTasks(gulp, taskConfig);

```

## Contributing

I wrote this package because maintaining my build process across multiple packages became a repetitive chore with large margin for error.

Although its quite opinionated, hopefully it will be a useful resource for other package authors. It's got all the nice things I found to component development easy and fun, like a lightning-quick rebuild process with gulp-reload, consolidated publishing, and automated deployment to github pages.

Please let me know if you think anything could be done better or you'd like to see a feature added. Issues and PR's welcome.


## License

MIT. Copyright (c) 2014 Jed Watson.
