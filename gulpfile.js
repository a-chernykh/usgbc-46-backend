var gulp   = require('gulp');
var lambda = require('gulp-awslambda');
var zip    = require('gulp-zip');

var lambdaOpts = {
    "publish": true,
    "region": "us-west-2",
    "profile": "aws-hack-16-deploy"
}

gulp.task('default', function() {
    return gulp.src('index.js')
        .pipe(zip('archive.zip'))
        .pipe(lambda("leaderboard", lambdaOpts))
        .pipe(gulp.dest('dist'));
});
