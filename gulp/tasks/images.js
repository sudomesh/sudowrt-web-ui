var changed = require('gulp-changed');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var notify = require('gulp-notify');
var imageminGifsicle = require('imagemin-gifsicle');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminOptipng = require('imagemin-optipng');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

var buildConfig = require('./config.js');
var dest = './web-build/images/';

gulp.task('build-gif', function() {
	return gulp.src('./web-src/images/**/*.{png,gif}')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(imageminGifsicle(buildConfig.image.gifopts)()) // Optimize
		.pipe(imageminOptipng(buildConfig.image.pngopts)()) // Optimize
		.pipe(gulp.dest(dest))
    .pipe(notify());
});

gulp.task('build-jpeg', function() {
  return gulp.src('./web-src/images/**/*.{jpg,jpeg}')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(imageminJpegtran(buildConfig.image.jpegopts)()) // Optimize
    .pipe(imagemin({
      use: [imageminJpegRecompress(buildConfig.image.jpegopts)]
    }))
		.pipe(gulp.dest(dest))
    .pipe(notify())
});

gulp.task('images', ['build-gif', 'build-jpeg']);
