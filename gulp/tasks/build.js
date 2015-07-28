var gulp = require('gulp');

gulp.task('build', ['less', 'static', 'browserify'], function(cb) {
  setTimeout(function () {
    cb();
  }, 1);
});
