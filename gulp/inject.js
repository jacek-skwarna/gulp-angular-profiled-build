'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

var browserSync = require('browser-sync');

// profiling builds
var argv = require('yargs').argv;
var replace = require('gulp-replace');
var multiDest = require('gulp-multi-dest');
var serversConfig = require('./servers-config.json');
var api = '';
var cdn = '';
var serversConfigContent = '';

console.log('w inject serversConfig: ' + JSON.stringify(serversConfig));
console.log('w inject argv: ' + JSON.stringify(argv));

if (argv._ && argv._[0] && argv._[0] === "build" && argv.type) {
  console.log("w build, type: " + argv.type);
  setServers(argv.type);
}

gulp.task('init-servers-config', function () {
  return gulp.src(path.join(conf.paths.src, '/servers-config.json'))
    .pipe(replace(/^(.*?[\s\S]*)$/, serversConfigContent))
    .pipe(multiDest([path.join(conf.paths.src, ''), path.join(conf.paths.tmp, '/serve')]));
});

gulp.task('inject-reload', ['inject'], function() {
  browserSync.reload();
});

gulp.task('inject', ['init-servers-config', 'scripts', 'styles'], function () {
  var injectStyles = gulp.src([
    path.join(conf.paths.tmp, '/serve/app/**/*.css'),
    path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
  ], { read: false });

  var injectScripts = gulp.src([
    path.join(conf.paths.src, '/app/**/*.module.js'),
    path.join(conf.paths.src, '/app/**/*.js'),
    path.join('!' + conf.paths.src, '/app/**/*.spec.js'),
    path.join('!' + conf.paths.src, '/app/**/*.mock.js'),
  ])
  .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

  var injectOptions = {
    ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
    addRootSlash: false
  };

  return gulp.src(path.join(conf.paths.src, '/*.html'))
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
});

///////
function setServers(buildType) {
  if (!buildType) {
    console.log("build type not provided");
    return;
  }

  if (!serversConfig[buildType] || !serversConfig[buildType].api || !serversConfig[buildType].cdn) {
    console.log("No proper configuration available for build type: " + buildType);
    return;
  }

  api = serversConfig[buildType].api;
  cdn = serversConfig[buildType].cdn;
  serversConfigContent = JSON.stringify(serversConfig[buildType]);
}
