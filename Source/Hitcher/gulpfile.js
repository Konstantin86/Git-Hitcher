var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),

//https://www.npmjs.com/package/gulp-processhtml/
//https://github.com/lazd/gulp-replace

    dist = 'scripts/dist';

gulp.task('compressScripts', function () {
  gulp.src([
  'app/namespaces.js'
  ])
  .pipe(plumber())
  .pipe(concat('appscripts.namespaces.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dist));

  gulp.src([
      'app/utils/**/*.js'
  ])
      .pipe(plumber())
      .pipe(concat('appscripts.utils.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(dist));

  gulp.src([
    'app/models/**/*.js'
  ])
    .pipe(plumber())
    .pipe(concat('appscripts.models.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist));

  gulp.src([
      'app/app.js'
  ])
      .pipe(plumber())
      .pipe(concat('appscripts.app.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(dist));

  gulp.src([
  'app/const/**/*.js'
  ])
  .pipe(plumber())
  .pipe(concat('appscripts.const.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest(dist));

  gulp.src([
    'app/config.js'
  ])
    .pipe(plumber())
    .pipe(concat('appscripts.config.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist));

  gulp.src([
'app/services/**/*.js'
  ])
.pipe(plumber())
.pipe(concat('appscripts.services.min.js'))
.pipe(uglify())
.pipe(gulp.dest(dist));

  gulp.src([
'app/directives/**/*.js'
  ])
.pipe(plumber())
.pipe(concat('appscripts.directives.min.js'))
.pipe(uglify())
.pipe(gulp.dest(dist));

  gulp.src([
    'app/controllers/**/*.js'
      ])
    .pipe(plumber())
    .pipe(concat('appscripts.controllers.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('watch', function () {
  gulp.watch(['app/**/*.js'],
      ['compressScripts']);
});

gulp.task('default', ['compressScripts', 'watch']);