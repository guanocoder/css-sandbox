const gulp = require('gulp');
const sass = require('gulp-sass');
const liveReload = require('gulp-livereload');

gulp.task('sass', () => {
    return gulp.src("./scss/index.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./www/build/css'))
        .pipe(liveReload());
})

gulp.task('sass:watch', () => {
    require('./server.js');
    liveReload.listen();
    gulp.watch('./scss/**/*.scss', ['sass']);
})