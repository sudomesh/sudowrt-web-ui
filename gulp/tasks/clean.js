var gulp    = require('gulp');
var del   = require('del');
var notify  = require('gulp-notify');

gulp.task('clean', function(cb) {
  del(['web-build/**'], cb);
});
