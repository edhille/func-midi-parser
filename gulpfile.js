/* globals Uint8Array, Buffer */
'use strict';

var gulp = require('gulp');
var through = require('through2');
var rename = require('gulp-rename');
var midiParser = require('./index');

function clean(cb) { 
	var del = require('del');
	del(['./test/sounds/parsed-midi.json']);
	cb(null);
}

function parseMidi() {
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) cb(null, file);

		if (file.isBuffer()) {
			var bytes = new Uint8Array(file.contents.length);
			for (var i = 0; i < bytes.length; ++i) {
				bytes[i] = file.contents.readUInt8(i);
			}
			file.contents = new Buffer(JSON.stringify(midiParser.parse(bytes)));
		}

		if (file.isStream()) {
			cb('Not setup to handle streams', file);
		}

		cb(null, file);
	});
}

function exportMidi() {
	return gulp.src('./test/sounds/minimal-valid-midi.mid')
		.pipe(parseMidi())
		.on('error', logError)
		.pipe(rename('parsed-midi.json'))
		.pipe(gulp.dest('./test/sounds/'));
}

function logError(err) {
	/* eslint no-console: [0] */
	console.error('ERROR:');
	console.error(err);
}

function test(cb, doCoverage) {
	return gulp.src('test/**/*.spec.js', { read: false })
		.pipe(require('gulp-spawn-mocha')({
			istanbul: doCoverage
		}));
}

function coverage(cb) {
	return test(cb, true);
}

gulp.task('clean', clean);
gulp.task('coverage', ['clean'], coverage);
gulp.task('export-midi', ['clean'], exportMidi);
