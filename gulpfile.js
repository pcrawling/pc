var gulp = require('gulp');
var react = require('gulp-react');
var stylus = require('gulp-stylus');

gulp.task('jsx', function () {
    setTimeout(function() {
        gulp.src('static/src/*')
            .pipe(react())
            .pipe(gulp.dest('static/build'));
    }, 300);

});

gulp.task('stylus', function () {
    setTimeout(function(){
        gulp.src('static/styl/*')
            .pipe(stylus())
            .pipe(gulp.dest('static/css'));
    }, 300);
});

gulp.task('watch', ['jsx', 'stylus'], function () {
    gulp.watch('static/src/*', ['jsx']);
    gulp.watch('static/styl/*', ['stylus']);
});

gulp.task('default', ['jsx', 'stylus']);