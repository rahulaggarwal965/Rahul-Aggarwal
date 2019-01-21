'use strict';

//Plugins
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync').create();
const child = require('child_process');
const cssnano = require('cssnano');
const del = require('del');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');

function browserSync(done){
  browsersync.init({
    server: {
      baseDir: './_site/'
    },
    port: 4000
  });
  done();
}

function browserSyncReload(done){
  browsersync.reload();
  done();
}

function clean() {
  return del(['./_site/assets/']);
}

function images() {
  return gulp
    .src('./assets/img/**/*') //pathToSRCImages
    .pipe(newer('./_site/assets/img')) //pathToDestImages
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false}]
      })
    )
    .pipe(gulp.dest('./_site/assets/img')); //pathToDestImages
}

function css(){
  return gulp
    .src('./assets/scss/**/*.scss') //pathtosrcscssfiles
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest('./_site/assets/css/')) //pathToDestCSS
    .pipe(rename({suffix: '.min' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest('./_site/assets/css/'))//pathToDestCSS
    .pipe(browsersync.stream());
}

function scriptsLint() {
  return gulp
    .src(['./assets/js/**/*', './gulpfile.js'])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function scripts() {
  return gulp
    .src(['./assets/js/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./_site/assets/js/'))
    .pipe(browsersync.stream());
}

function content(){
  return gulp
    .src('./_pugfiles/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./_includes'));
}

function jekyll(){
  return child.spawn('bundle', ['exec', 'jekyll', 'build'], { stdio: 'inherit'});
}

function  watchFiles(){
  gulp.watch('./assets/scss/**/*', css); //scss files
  gulp.watch('./_pugfiles/**/*.pug', content); //pug files
  gulp.watch('./assets/js/**/*', gulp.series(scriptsLint, scripts));
  gulp.watch(
    [
      './_includes/**/*',
      './_layouts/**/*',
      './_pages/**/*',
      './_posts/**/*'
    ],
    gulp.series(jekyll, browserSyncReload)
  );
  gulp.watch('./assets/img/**/*', images); //images
}

gulp.task('images', images);
gulp.task('css', css);
gulp.task('jekyll', jekyll);
gulp.task('js', gulp.series(scriptsLint, scripts));
gulp.task('clean', clean);
gulp.task('content', content);

gulp.task('build', gulp.series(clean, gulp.parallel(content, css, images, jekyll, 'js')));

gulp.task('watch', gulp.parallel(watchFiles, browserSync));

gulp.task('default', gulp.series('build', 'watch'));
