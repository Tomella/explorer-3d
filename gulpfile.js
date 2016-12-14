var buffer = require('vinyl-buffer');
var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var rollup = require('rollup-stream');
var rollupTypescript = require('rollup-plugin-typescript');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tslint = require("gulp-tslint");
var uglify = require('gulp-uglify');


var ASSETS_BASE = "dist";
var RESOURCES_BASE = 'dist/resources';
var EXAMPLE_OUT_BASE = 'examples/dist';

gulp.task('workers', function () {
   return gulp.src('./source/workers/*.js')
      .pipe(gulp.dest("dist/workers"));
});

gulp.task('libs', function() {
  return rollup({
      entry: './source/libs.ts',
      plugins: [
         rollupTypescript()
      ],
		format: 'umd',
		moduleName: 'Explorer3d',
    })
    .pipe(source('libs.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
  return rollup({
      entry: './source/explorer3d.ts',
      plugins: [
         rollupTypescript()
      ],
		format: 'umd',
		moduleName: 'Explorer3d',
    })
    .pipe(source('explorer3d.js'))
    .pipe(gulp.dest('./dist'));
});


gulp.task('dist', ['build', 'libs', 'workers'], function () {
   return gulp.src(['dist/*.js', '!dist/*.min.js'])
      .pipe(uglify())
      .pipe(rename({
         extname: '.min.js'
      }))
      .pipe(gulp.dest('dist'));
});

gulp.task('resources', function () {
   return gulp.src('resources/**/*')
      .pipe(gulp.dest(RESOURCES_BASE));
});

gulp.task('examples', ['dist', 'resources']);

gulp.task("tslint", function() {
    return gulp.src("source/**/*.ts")
        .pipe(tslint())
        .pipe(tslint.report({
            emitError: false
        }));
});

// Watch Files For Changes
gulp.task('watch', function () {
   // We'll watch JS, SCSS and HTML files.
   gulp.watch('source/**/*.ts', ['tslint']);
   gulp.watch(['source/**/*.js', 'source/**/*.ts'], ['examples']);
});

gulp.task('clean', function (cb) {
   return del(["dist"], cb);
});

gulp.task('default', ['examples', 'tslint', 'watch']);