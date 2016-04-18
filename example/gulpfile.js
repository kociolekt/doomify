var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');
var gif = require('gulp-if');

// --dev (gulp --dev)
var dev = util.env.dev;

var chalk = util.colors;

// dev === true - szybki build, mapy inline
// nie chcesz map na prod? - usuń linie z sourcemaps i debug na false (debug: dev)
gulp.task('js-browserify', function() {
  return browserify({
    entries: ['./js/main-a.js'],
    transform: [
      'doomify'
    ],
    debug: true
  })
    .bundle()
    .on('error', function(err) {
      util.log(chalk.red(err.toString()));
      this.emit('end');
    })
    .pipe(source('main-a.js'))
    .pipe(buffer())
    .pipe(gif(!dev, sourcemaps.init({loadMaps: true})))
    .pipe(gif(!dev, uglify()))
    .pipe(gif(!dev, sourcemaps.write('./')))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {

  gulp.watch('./js/**/*.js', ['js-browserify']);

});

gulp.task('default', ['js-browserify', 'watch']);
