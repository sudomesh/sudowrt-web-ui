var changed = require('gulp-changed');
var gulp = require('gulp');
var notify = require('gulp-notify');
var merge = require('merge-stream');

gulp.task('html', function() {
	var dest = './web-build/';

	return gulp.src('./web-src/index.html')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(gulp.dest(dest))
    .pipe(notify());
});

gulp.task('fonts', function() {
	var dest = './web-build/css/fonts/';

	var ourFonts = gulp.src('./web-src/fonts/**')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(gulp.dest(dest))
    .pipe(notify());

	var bootstrapFonts = gulp.src('./web-src/bower_components/bootstrap/fonts/**')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(gulp.dest(dest))
    .pipe(notify());

  return merge(ourFonts, bootstrapFonts);
});

gulp.task('static', ['html', 'fonts', 'images']);
