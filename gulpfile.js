var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var nodemon = require('gulp-nodemon');
var plumber = require('gulp-plumber');
var beeper = require('beeper');
var stylus = require('gulp-stylus');
var addsrc = require('gulp-add-src');
var less = require('gulp-less');
var runSequence = require('run-sequence');
var rm = require('gulp-rimraf');
var async = require('async');
var gulpFilter = require('gulp-filter');
var minifycss = require('gulp-minify-css');
var mainBowerFiles = require('main-bower-files');
var merge = require('merge-stream');
var streamqueue = require('streamqueue');
var gulpif = require('gulp-if');


var argv = require('yargs').argv;
var jwtService = require('./server/service/jwtTokenService');

var minifyFiles = true;
var buildOptionsPrintedToConsole = false;

function onError(err) {
	beeper();
	console.log(err);
}

gulp.task('bowerScripts', ['setBuildOptions'], function(cb) {
    var jsFilter = gulpFilter(['*.js', '!*.min.js'], {restore: true});
    var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf'], {restore: true});

   	gulp.src(mainBowerFiles())
        		.pipe(jsFilter)
        		.pipe(gulp.dest('dist/bowerScriptFilesList'))
        		.pipe(sourcemaps.init())
        		.pipe(concat('bowerComponents.js'))
        		.pipe(gulpif(minifyFiles, uglify()))
        		.pipe(gulpif(minifyFiles, sourcemaps.write('./sourcemaps')))
    			.pipe(gulp.dest('dist/js'))
    			.on('end', cb);
});

gulp.task('scripts', ['setBuildOptions'], function(cb) {
	gulp.src(['app/scripts/**/*.js'])
		.pipe(sourcemaps.init())
    	.pipe(concat('scripts.js'))
    	.pipe(gulpif(minifyFiles, uglify()))
        .pipe(gulpif(minifyFiles, sourcemaps.write('./sourcemaps')))
    	.pipe(gulp.dest('dist/js'))
    	.on('end', cb);
    
});

gulp.task('lintScripts', function() {
	var appScripts = function(cb) {
		gulp.src(['app/scripts/**/*.js'])
	    .pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.on('end', cb);	    	
	}	

	gulp.src(['server/**/*.js'])
	.pipe(jshint())
	.pipe(jshint.reporter(stylish))
	.on('end', appScripts);
	
});
gulp.task('bowerStyles', ['setBuildOptions'], function(cb) {
	var cssFilter = gulpFilter(['*.css', '!*.min.css']);
	async.series([
		function(next) {
			gulp.src(mainBowerFiles())
	        .pipe(cssFilter)
			.pipe(gulp.dest('dist/bowerCSSFileList'))
			.pipe(concat('bowerComponents.css'))
			.pipe(gulpif(minifyFiles, minifycss()))
			.pipe(gulp.dest('dist/styles'))
			.on('end', next);
		},
		function(next) {
			gulp.src(['bower_components/font-awesome/css/font-awesome.css'])
			.pipe(gulp.dest('dist/styles'))
			.on('end', next);
		},
		function(next) {
			gulp.src('bower_components/bootstrap/fonts/*')
			.pipe(gulp.dest('dist/fonts'))
			.on('end', next);
		},
		function(next) {
			gulp.src('bower_components/font-awesome/fonts/*')
			.pipe(gulp.dest('dist/fonts'))
			.on('end', next);
		}
		], cb);
});

gulp.task('styles', ['setBuildOptions'], function(cb) {

	// var cssFilter = gulpFilter(['*.css', '!.min.css'], {restore: true});

	var queue = streamqueue({ objectMode: true });
	queue.queue(gulp.src(['app/styles/**/*.css']));
	queue.queue(gulp.src(['app/styles/**/*.styl']).pipe(stylus()));
	
	queue.done()
	.pipe(plumber({
				errorHandler: onError
			}))
	.pipe(concat('styles.css'))
	.pipe(gulpif(minifyFiles, minifycss()))
	.pipe(gulp.dest('dist/styles'));
	cb();
});

gulp.task('del', function(cb) {
	return gulp.src('dist').pipe(rm());	

});

gulp.task('watch', function() {
	gulp.watch('app/styles/**/*', ['styles']);
	gulp.watch('app/scripts/**/*.js', ['scripts']);
});

gulp.task('nodemon', function() {
	beeper();
	nodemon({
	    script: './startServer.js'
	    /*ignore: [
	      '/app/scripts/**',
	      '/node_modules/**',
	      '/bower_components/**',
	      '/test',
	      '*'	     
	    ]*/
  	}).on('start', function () {
    		console.log("Nodemon started and monitoring.");
    		
    		
  		})
  	.on('restart', function() {
  		console.log("Nodemon restart...");
  	});
});


gulp.task('build', function () {

	runSequence(['lintScripts', 'del'], ['bowerStyles', 'styles', 'bowerScripts', 'scripts']);
});
gulp.task('dev', function() {
	runSequence(['nodemon', 'watch']);
});

// Set all tasks to run for development or production 
// based on 'dev' being passed as argument 
// (gulp [task] dev).
gulp.task('setBuildOptions', function(cb) {
	if (argv.dev) {
		if (!buildOptionsPrintedToConsole) {
			console.log("\n=== Building for development without minification files ===\n");
		}
		minifyFiles = false;
	}
	else {
		minifyFiles = true;
		console.log("\n=== Building for production with minification of files ===\n");
	}
	cb();
});


gulp.task('resetJWTKey', function() {
	jwtService.createNewKey();
	
}); 

// Call syntax: gulp createAdminUser --username='[username]' --password='[password]'
gulp.task('createAdminUser', function() {
	console.log(argv.username);
	console.log(argv.password);
	var userService = require('./server/userService');
	var user = {
		username: argv.username,
		password: argv.password,
		role: 'admin'
		};

	userService.create(user);

}); 
