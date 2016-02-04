import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import mainBowerFiles from 'main-bower-files';
import karma from 'karma';
import webserver from 'gulp-webserver';
import ngAnnotate from 'gulp-ng-annotate';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}

gulp.task('lint', lint(['app/scripts/**/*.js', 'app/scripts/**/*.es6']));
gulp.task('lint:test', lint('test/spec/**/*.js'));

gulp.task('minify', ['scripts', 'styles'], () => {
  const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});
  return gulp.src('app/**/*.html')
    .pipe(assets)
    .pipe($.if('*.js', ngAnnotate()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.es6')
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('config', () => {
  return gulp.src('app/config/**/*.json')
    .pipe(gulp.dest('dist/config'));
});

gulp.task('fonts', () => {
  return gulp.src(mainBowerFiles({
      filter: '**/*.{otf,eot,svg,ttf,woff,woff2}'
    }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

// .ico and other files
gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/scripts/**/*.html',
    'app/config/**/*.json',
    'app/images/**/*',
    '.tmp/fonts/**/*',
    '.tmp/scripts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('app/scripts/**/*.es6', ['scripts']);
});

gulp.task('serve:dist', ['build:dist'], () => {
  gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      port: 9000
    }));
});

gulp.task('karma', () => {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
  }).start();
});

gulp.task('karma:watch', () => {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }).start();
});

gulp.task('build:dist', ['lint', 'minify', 'images', 'config', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build:clean', ['clean'], () => {
  gulp.start('build');
});

gulp.task('test', ['build:dist'], () => {
  gulp.start('karma');
});

gulp.task('test:watch', ['build:dist'], () => {
  gulp.start('karma:watch');
});

gulp.task('default', ['serve']);
