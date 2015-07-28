var gulp = require('gulp');

gulp.task('watch', ['build'], function() {
	gulp.watch('./web-src/js/**', ['browserify']);
	gulp.watch('./web-src/less/**', ['less']);
	gulp.watch('./web-src/fonts/**', ['fonts']);
	gulp.watch('./web-src/images/**', ['images']);
	gulp.watch('./web-src/*.html', ['html']);
	gulp.watch('./web-src/bower_components/**', ['less']);
});
