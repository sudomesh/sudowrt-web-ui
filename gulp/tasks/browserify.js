var browserify   = require('browserify');
var argv         = require('yargs').argv
var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var uglify       = require('gulp-uglify');
var notify       = require('gulp-notify');
var riotify      = require('riotify');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer');
var sourcemaps   = require('gulp-sourcemaps');

var output = argv.prod ? 'bundle.min.js' : 'bundle.js';

gulp.task('browserify', function() {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: ['./web-src/js/main.js'],
    debug: !argv.prod,
    // defining transforms here will avoid crashing your stream?
    // transform: [riotify, {type: 'es6', ext: 'tag'}]
  });

  return b.transform(riotify, {type: 'es6', ext: 'tag'})
    .bundle()
    .on('error', notify.onError("Error: <%= error.message %>"))
    .pipe(source(output))
    .pipe(buffer())
    .pipe(gulpif(argv.prod, uglify()))
    .pipe(gulpif(!argv.prod, sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(!argv.prod, sourcemaps.write('./')))
    .on("error", notify.onError("Error: <%= error.message %>"))
    .pipe(gulp.dest('./web-build/js/'))
    .pipe(notify());
});
