// require
const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');

// tasks
gulp.task('default', async () => {
    del('build');

    return tsProject.src()
        .pipe(plumber())
        .pipe(tsProject())
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});