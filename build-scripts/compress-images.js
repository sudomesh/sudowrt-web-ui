var Imagemin = require('imagemin');
var buildConfig = require('./config.js').build;
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// jpegs get special treatment
new Imagemin()
	.src('web-src/images/*.{jpg,jpeg}')
	.dest('web-build/images')
	.use(imageminJpegRecompress(buildConfig.image.jpegopts))
	.use(Imagemin.jpegtran(buildConfig.image.jpegopts))
	.run()

	new Imagemin()
	.src('web-src/images/*.{gif,png}')
	.use(Imagemin.gifsicle(buildConfig.image.gifopts))
	.use(Imagemin.optipng(buildConfig.image.pngopts))
	.run();
