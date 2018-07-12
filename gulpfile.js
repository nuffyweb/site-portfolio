'use strict';

var gulp = require('gulp');
var debug = require('gulp-debug');
var atch = require('gulp-watch');
var sass = require('gulp-sass');
var importCss = require('gulp-import-css');
var autoprefixer = require('gulp-autoprefixer');
var rigger = require('gulp-rigger');
var cheerio = require('gulp-cheerio');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
/*var imageop = require('gulp-image-optimization');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var gifsicle = require('imagemin-gifsicle');
var jpegtran = require('imagemin-jpegtran');
var optipng = require('imagemin-optipng');
var svgo = require('imagemin-svgo');
var jpegRecompress = require('imagemin-jpeg-recompress');*/
var tinypng = require('gulp-tinypng');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var csso = require('gulp-csso');
var csscomb = require('gulp-csscomb');
var rename = require('gulp-rename');
var compass = require('gulp-compass');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var wiredep = require('gulp-wiredep');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var argv = require('yargs').argv;
var browserSync = require('browser-sync').create();
var del = require('del');
var newer = require('gulp-newer');
var cache = require('gulp-cache');
var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

var path = {
    frontend: { //Пути исходников
        html: 'frontend/*.html',
        js: 'frontend/js/main.js',
        styles: 'frontend/styles/main.css',
        img: 'frontend/image/img/**/*.*',
        svg: 'frontend/image/svg/**/*.*',
        fonts: 'frontends/fonts/**/*.*'
    },
    public: { // Готовые файлы
        html: 'public/',
        js: 'public/js/',
        css: 'public/css/',
        img: 'public/img/',
        svg: 'public/svg/',
        fonts: 'public/fonts/'
    },
    watch: {
        html: 'frontend/**/*.html',
        js: 'frontend/js/**/*.js',
        styles: 'frontend/styles/**/*.*',
        img: 'frontend/image/img/**/*.*',
        fonts: 'frontend/fonts/**/*.*'
    }
};

// Собираем стили
gulp.task('styles', function() {
    return gulp.src(path.frontend.styles)
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(importCss())
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(csscomb())
        .pipe(csso())
        .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.public.css))
        .pipe(browserSync.reload({ stream: true }));
});


// Собираем статические картинки
gulp.task('images', function() {
    return gulp.src(path.frontend.img, { since: gulp.lastRun('images') })
        .pipe(newer(path.public.img))
			  //.pipe(cache(tinypng('YOUR API')))
				/*.pipe(imageop())
				.pipe(imagemin([
					imagemin.jpegtran({
						progressive: true
					}),
					imagemin.optipng({
						optimizationLevel: 5
					}),
					imagemin.svgo({
						plugins: [{
							removeViewBox: false
						}]
					})
				]))
				
        .pipe(cache(imagemin({
					interlaced: true,
					progressive: true,
					use: [pngquant()]
					imagemin.gifsicle({ interlaced: true }),
					imagemin.jpegtran({ progressive: true }),
					imagemin.optipng({ optimizationLevel: 3 }),
					imagemin.svgo(),
					jpegRecompress({
						plugins: [
							{loops: 5},
               {min: 65},
                {max: 70},
                {quality: 'medium'}
						] 
            }),
          pngquant({ 
						plugins:  [
							{quality: '65-70'},
							{speed: 5}
						]
						})
					}, {
            verbose: true
        })))*/
        .pipe(gulp.dest(path.public.img));
});

// Собираем svg спрайты
gulp.task('svg', function() {
    return gulp.src(path.frontend.svg, { since: gulp.lastRun('svg') })
        .pipe(svgmin(function(file) {
            return {
                plugins: [{
                        removeTitle: true
                    },
                    {
                        removeAttrs: {
                            attrs: "(fill|stroke)"
                        }
                    },
                    {
                        removeStyleElement: true
                    },
                    {
                        cleanupIDs: {
                            minify: true
                        }
                    }
                ]
            }
        }))
        .pipe(rename({ prefix: "icon-" }))
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest(path.public.svg));
});

// Собираем шрифты
gulp.task('fonts', function() {
    return gulp.src(path.frontend.fonts, { since: gulp.lastRun('fonts') })

    .pipe(gulp.dest(path.public.fonts));
});

// Собираем html файлы
gulp.task('html', function() {
    return gulp.src(path.frontend.html)
        .pipe(debug({ title: 'html' }))
        .pipe(rigger())
        .pipe(gulp.dest(path.public.html))
        .pipe(browserSync.reload({ stream: true }));
});

// Собираем js файлы
gulp.task('js', function() {
    return gulp.src(path.frontend.js, )
        .pipe(debug({ title: 'js' }))
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
				.pipe(sourcemaps.write())
				.pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.public.js))
        .pipe(browserSync.reload({ stream: true }));
});


gulp.task('clean', function() {
    return del('public');
});

gulp.task('clear', function(done) {
    return cache.clearAll(done);
});

// Собираем файлы
gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'html', 'svg', 'js', 'images', 'fonts')));

// Следим за файлами
gulp.task('watch', function() {
    gulp.watch(path.watch.styles, gulp.series('styles'));
    gulp.watch(path.watch.html, gulp.series('html'));
});


// Запускаем сервер для разработки
gulp.task('serve', function() {
    browserSync.init({
        server: 'public'
    });

    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));