var browserify   = require('browserify');
var argv         = require('yargs').argv;
var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var uglify       = require('gulp-uglify');
var notify       = require('gulp-notify');
var riotify      = require('riotify');
var watchify     = require('watchify');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer');
var sourcemaps   = require('gulp-sourcemaps');

var output = argv.prod ? 'bundle.min.js' : 'bundle.js';

gulp.task('browserify', function() {

  var b = browserify({
    entries: ['./web-src/js/main.js'],
    debug: !argv.prod,
  });

  var bundle = function() {
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
  };

  if (argv.prod) {
    b = watchify(b);
    b.on('update', bundle);
  }

  return bundle();
});
