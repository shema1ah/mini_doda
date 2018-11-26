module.exports = function (grunt) {

	const PATH_DIST = 'dist/';
	const PATH_SRC = 'src/';
	// const ENV = process.env;

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: [PATH_DIST],
		copy: {
			main: {
				files: [
					// makes all src relative to cwd
					{
						expand: true,
						cwd: PATH_SRC,
						src: ['**'],
						dest: PATH_DIST,
						filter: 'isFile'
					},
				],
			},
		},
		'json-minify': {
			build: {
				files: PATH_DIST + '/**/*.json'
			}
		},
		sass: {
			options: {
				sourceMap: false
			},
			dist: {
				files: [{
					expand: true,
					cwd: PATH_SRC,
					src: ['**/*.scss'],
					dest: PATH_DIST
				}]
			}
		},
		uglify: {
			options: {
				mangle: {
					reserved: ['jQuery', 'Backbone']
				},
				banner: '/*! <%= pkg.name %> release in <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				sourceMap: true,
				sourceMapName: 'path/to/sourcemap.map',
				files: [{
					expand: true,
					src: ['**/*.js'],
					dest: PATH_DIST,
					cwd: PATH_SRC,
					/* rename: function(dst, src) {
                        // To keep the source js files and make new files as `*.min.js`:
                        // return dst + '/' + src.replace('.js', '.min.js');
                        // Or to override to src:
                        return src;
                    } */
				}]
			}
		},
		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: PATH_SRC,
					src: ['**/*.{png,jpg,gif}'],
					dest: PATH_DIST
				}]
			}
		},
		htmlmin: { // Task
			dist: { // Target
				options: { // Target options
					removeComments: true,
					collapseWhitespace: true
				},
				files: [{
					expand: true,
					cwd: PATH_SRC,
					src: ['**/*.html'],
					dest: PATH_DIST
				}]
			}
		},
		xmlmin: { // Task
			dist: { // Target
				options: { // Target options
					preserveComments: true
				},
				files: [{
					expand: true,
					cwd: PATH_SRC,
					src: ['**/*.wxml'],
					dest: PATH_DIST
				}]
			}
		},
		fileregexrename: {
			dist: {
				files: [{
					expand: true,
					cwd: PATH_DIST,
					src: ['**/*.*'],
					dest: PATH_DIST
				}],
				options: {
					replacements: [{
						pattern: /\.scss/ig,
						replacement: '.wxss'
					}]
				}
			}
		},

		watch: {
			scripts: {
				files: [PATH_SRC + '**/*.*'],
				tasks: ['copy', 'sass', 'fileregexrename', 'string-replace'],
				options: {
					spawn: false,
				},
			},
		},

		'string-replace': {
			dist: {
				files: [{
					expand: true,
					cwd: PATH_DIST,
					src: ['**/*.wxss'],
					dest: PATH_DIST
				}],
				options: {
					replacements: [{
						pattern: /px;/ig,
						replacement: 'rpx;'
					}, {
						pattern: /px\s/g,
						replacement: 'rpx '
					}]
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-json-minify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-xmlmin');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-file-regex-rename');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-string-replace');

	// Default task(s).
	grunt.registerTask('default2', ['clean', 'copy', 'json-minify', 'uglify', 'imagemin', 'htmlmin', 'xmlmin', 'sass', 'fileregexrename', 'string-replace']);
	grunt.registerTask('default', ['clean', 'copy', 'uglify', 'imagemin', 'htmlmin', 'xmlmin', 'sass', 'fileregexrename', 'string-replace']);

	grunt.registerTask('test', ['clean', 'copy', 'sass', 'fileregexrename']);

	grunt.registerTask('cc', ['clean']);

	// On watch events configure jshint:all to only run on changed file
	grunt.event.on('watch', function (action, filepath) {
		grunt.config('file change =>', filepath);
	});

}; //exports end