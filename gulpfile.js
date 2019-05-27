// require
const gulp = require('gulp');
const del = require('del');

// plugins
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

// tasks
gulp.task('default', async () => {
    del('build');

    return gulp.src('src/**/*.js')
        .pipe(plumber())
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});