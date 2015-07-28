var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var notify = require('gulp-notify');
var gulpif = require('gulp-if');
var argv = require('yargs').argv
var LessPluginCleanCSS = require('less-plugin-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var cleancss = new LessPluginCleanCSS({ advanced: true });
var rename = require('gulp-rename');

var lessOpts = {
  paths: [ path.join('web-src', 'less', 'libs'), path.join('web-src', 'bower_components', 'bootstrap', 'less') ],
}

var fileName = 'bundle.css';

if (argv.prod) {
  lessOpts.plugins = [cleancss];
  fileName = 'bundle.min.css';
}

gulp.task('less', function () {
  return gulp.src('./web-src/less/*.less')
    .pipe(gulpif(!argv.prod, sourcemaps.init({loadMaps: true})))
    .pipe(less(lessOpts))
    .pipe(sourcemaps.write('./maps'))
    .pipe(rename(fileName))
    .pipe(gulp.dest('./web-build/css'))
    .pipe(notify());
});
