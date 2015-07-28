var changed    = require('gulp-changed');
var gulp       = require('gulp');
var notify     = require('gulp-notify');

gulp.task('html', function() {
	var dest = './web-build/';

	return gulp.src('./web-src/index.html')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(gulp.dest(dest))
    .pipe(notify());
});
