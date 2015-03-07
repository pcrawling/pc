var gulp = require('gulp');
var react = require('gulp-react');
var stylus = require('gulp-stylus');

gulp.task('jsx', function () {
    gulp.src('static/src/*')
        .pipe(react())
        .pipe(gulp.dest('static/build'));
});

gulp.task('stylus', function () {
    gulp.src('static/styl/*')
        .pipe(stylus())
        .pipe(gulp.dest('static/css'));
});

gulp.task('watch', function () {
    gulp.watch('static/src/*', ['jsx']);
    gulp.watch('static/styl/*', ['stylus']);
});

gulp.task('default', ['jsx', 'stylus']);