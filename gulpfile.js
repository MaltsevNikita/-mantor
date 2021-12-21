let project_folder = "dist";
let source_folder = "#src"; //сюда скидывать исходники

let path={
  build:{
    html: project_folder +  "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src:{
    html: source_folder +  "/*.html",
    css: source_folder + "/sass/style.sass",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch:{
    html: source_folder +  "/**/*.html",
    css: source_folder + "/sass/**/*.sass",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  }
  ,
  clean:"./" + project_folder + "/"
}

// ======================Объявляем переменную==============================================================
let { src,dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  sass = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  webpcss = require('gulp-webp-css'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2');



function clean(params){
  return del(path.clean);
}

function browserSync(params){
  browsersync.init({
    server:{
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })

}

// функция для слежки============
function watchFiles(params){
  gulp.watch([path.watch.html] , html);
  gulp.watch([path.watch.css] , css);
  gulp.watch([path.watch.js] , js);
  gulp.watch([path.watch.img] , images);
}

// переменная перечисляющая функции для выполнения сборки===========
let build = gulp.series(clean, gulp.parallel( js ,html, css, images, fonts));  
let watch = gulp.parallel(build,browserSync, watchFiles);


// функция работы с html=============================================
function html(){
 return src(path.src.html)
  .pipe(fileinclude()) // объединяет html файлы============
  .pipe(webphtml())
  .pipe(dest(path.build.html))
  .pipe(browsersync.stream())
}
// функция раоты со стилями=========================================
function css(){
  return src(path.src.css)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
      )
      .pipe(
        group_media()
      )
      .pipe(webpcss())
      .pipe(dest(path.build.css))
      
      .pipe(clean_css())
      .pipe(
        rename({
          extname: ".min.css"
        })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
}
// функция работы с js=============================================
function js(){
 return src(path.src.js)
  .pipe(fileinclude()) // объединяет js файлы============
  .pipe(dest(path.build.js))
  .pipe(
      uglify()
    )
  .pipe(
     rename({
       extname: ".min.js"
     })
  )
  .pipe(dest(path.build.js))
  .pipe(browsersync.stream())
}
function images(){
 return src(path.src.img)
  .pipe(
    webp({
      quality:70
    })
  )
  .pipe(dest(path.build.img))
  .pipe(src(path.src.img))
  .pipe(
    imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3
    })
  )
  .pipe(dest(path.build.img))
  .pipe(browsersync.stream())
}
// функция обработки шрифтов
function fonts(){
  return src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
    
}

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.watch = watch;
exports.build = build;
exports.default = watch;