const { src, dest, watch, parallel, series, task } = require('gulp');

const sass         = require('gulp-sass')(require('sass'));
const rename       = require('gulp-rename');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const cssmin       = require('gulp-cssmin');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps   = require('gulp-sourcemaps');
const imagemin     = require('gulp-imagemin');
const del          = require('del');




function browsersyns(){
    browserSync.init({
        server: "app/"
    });
}


function cleanDist(){
    return del('dist')
}


function images(){
    return src('app/images/**/*')
    .pipe(imagemin(
        [
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/images'))
}


function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
        'node_modules/mixitup/dist/mixitup.js',
        'node_modules/rateyo/src/jquery.rateyo.js',
        'node_modules/@fancyapps/ui/dist/fancybox.umd.js',
        'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styleLibs(){
  return src([
    'node_modules/normalize.css/normalize.css',
    'node_modules/slick-carousel/slick/slick.css',
    'node_modules/magnific-popup/dist/magnific-popup.css',
    'node_modules/rateyo/src/jquery.rateyo.css',
    'node_modules/@fancyapps/ui/dist/fancybox.css',
    'node_modules/jquery-form-styler/dist/jquery.formstyler.css',
  ])
    .pipe(concat('libs.min.css'))
    .pipe(cssmin())
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function styles(){
    return src('app/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true,
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function build(){
    return src([
        'app/css/libs.min.css',
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ],      {base: 'app'})
            .pipe(dest('dist'))
}

function watching(){
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch("app/*.html").on('change', browserSync.reload);
}


exports.styles      = styles;
exports.styleLibs   = styleLibs;
exports.watching    = watching;
exports.browsersyns = browsersyns;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanDist   = cleanDist;

exports.build       = series(cleanDist, images, build);
exports.default     = parallel(styles, styleLibs, scripts, browsersyns, watching);