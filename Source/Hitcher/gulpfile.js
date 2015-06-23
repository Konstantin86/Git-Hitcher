var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    dist = 'scripts/dist';

gulp.task('compressScripts', function () {
    gulp.src([
        'app/**/*.js'
    ])
        .pipe(plumber())
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist));
});

gulp.task('watch', function () {
    gulp.watch(['app/**/*.js'],
        ['compressScripts']);
});

gulp.task('default', ['compressScripts', 'watch']);