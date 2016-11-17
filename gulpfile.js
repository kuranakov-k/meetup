var gulp        = require("gulp"),
   clean        = require('gulp-clean'),
	 sass         = require("gulp-sass"),
	 browserSync  = require("browser-sync"),
	 concat       = require("gulp-concat"),
	 uglify       = require("gulp-uglifyjs"),
	 cssnano      = require("gulp-cssnano"),
	 rename       = require("gulp-rename"),
	 del          = require("del"),
	 imagemin     = require("gulp-imagemin"),
	 pngquant     = require("imagemin-pngquant"),
	 cache        = require("gulp-cache"),
	 autoprefixer = require("gulp-autoprefixer"),
	 rimraf       = require("rimraf"),
	 rigger       = require("gulp-rigger"),
	 plumber      = require("gulp-plumber");

var path = {
	build: { // Where put files after building
		html: "dist/",
		js: "dist/js/",
		css: "dist/css/",
		img: "dist/img/",
		fonts: "dist/css/fonts/"
	},
	src: { // Where are we working
		html: "app/*.html",
		js: "app/js/*.js",
		sass: "app/sass/**/*.sass",
		scss: "app/sass/**/*.scss",
		css: "app/css/*.css",
		img: "app/img/**/*.*",
		fonts: "app/css/fonts/**/*.*"
	},
	watch: { // What files we want to wathcing for
		html: "app/**/*.html",
		js: "app/js/**/*.js",
		css: "app/sass/**/*.sass",
		img: "app/img/**/*.*",
		fonts: "app/css/fonts/**/*.*"
	},
	clean: "./dist"
};
gulp.task("js", function() {
	return gulp.src("app/js/main.js")
		.pipe(rigger())
		.pipe(concat("main.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest("app/js/"))
		.pipe(browserSync.reload({stream:true}))
});
gulp.task("html:build", function() {
	gulp.src(["app/pages/*.html"])
		.pipe(rigger())
		.pipe(gulp.dest("app/"))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task("css:build", function() {
	return gulp.src(path.src.css)
	.pipe(concat("main.min.css"))
	.pipe(cssnano())
	.pipe(gulp.dest(path.build.css));
});

gulp.task("js:build", function() {
	return gulp.src("app/js/main.js")
		.pipe(rigger())
		.pipe(concat("main.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest(path.build.js));
});
gulp.task("sass", function() {
	gulp.src(path.src.sass)
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {cascade: true}))
		.pipe(rename({"suffix": ".min"}))
		.pipe(gulp.dest("app/css"))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task("browser-sync", function() {
	browserSync({
		server: {
			baseDir: "app"
		},
		notify: false
	});
});

gulp.task("clean", function() {
	return del.sync("dist");
});

gulp.task("index:clean", function(){
	return gulp.src('app/index.html')
    .pipe(clean());
});

gulp.task("clear", function() {
	return cache.clearAll();
});

gulp.task("img", function() {
	return gulp.src(path.src.img)
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest(path.build.img));
});

gulp.task("watch", ["html:build", "browser-sync", "sass", "js"], function() {
	gulp.watch(path.src.sass, ["sass"]);
	gulp.watch(path.src.scss, ["sass"]);
	gulp.watch("app/js/main.js", ["js"], browserSync.reload);
	gulp.watch("app/js/custom/custom.js", browserSync.reload);
	gulp.watch(["app/**/*.html", "!app/index.html"], ["html:build"], browserSync.reload);
	gulp.watch(path.src.css, browserSync.reload);
});

gulp.task("build", ["clean", "img", "sass", "css:build", "js:build"], function() {

	var buildCss = gulp.src([
		"app/css/main.css"
		])
		.pipe(gulp.dest(path.build.css));

	var buildFonts = gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));

	var buildJs = gulp.src(["app/js/main.min.js"])
		.pipe(gulp.dest(path.build.js));

	var buildHtml = gulp.src(path.src.html)
		.pipe(gulp.dest(path.build.html));

});