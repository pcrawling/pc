'use strict';

var gulp = require('gulp');
var stylus = require('gulp-stylus');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
    browserify({
        entries: './static/src/index.jsx',
        extensions: ['.jsx'],
        debug: true
    })
    .transform(babelify.configure({
      experimental: true
    }))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('stylus', function () {
    gulp.src('static/styl/*')
        .pipe(stylus())
        .pipe(gulp.dest('static/css'));
});

gulp.task('watch', ['build', 'stylus'], function () {
    gulp.watch('static/src/*', ['build']);
    gulp.watch('static/styl/*', ['stylus']);
});

gulp.task('default', ['build', 'watch']);
