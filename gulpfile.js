var gulp   = require('gulp');
var lambda = require('gulp-awslambda');
var zip    = require('gulp-zip');
var path = require('path');
var clean = require('gulp-clean');

var lambdaOpts = {
    "publish": true,
    "region": "us-west-2",
    "profile": "aws-hack-16-deploy"
}

var src = ['index.js', 'node_modules/!(gulp*)/**'];

gulp.task('default', ['deploy']);

gulp.task('package', ['clean'], function() {
    return gulp.src(src,  {base: "."})
        .pipe(gulp.dest('build'))
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return gulp.src(['build', 'dist'])
        .pipe(clean(), {read: false});
});

gulp.task('deploy', ['package'], function() {
    return gulp.src('dist/archive.zip')
        .pipe(lambda("leaderboard", lambdaOpts));
});
