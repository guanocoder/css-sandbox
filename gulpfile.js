const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', () => {
    return gulp.src("./scss/index.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./www/build/css'));
})

gulp.task('sass:watch', () => {
    gulp.watch('./scss/**/*.scss', ['sass']);
})