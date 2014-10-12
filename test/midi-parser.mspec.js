/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
/* globals describe: true, before: true, beforeEach: true, afterEach: true, it: true, Uint8Array: true, xit: true */
'use strict';

var fs = require('fs'),
    chai = require('chai'),
    midiParser = require('../index.js'),
    types = midiParser.types,
    MidiNoteOnEvent = types.MidiNoteOnEvent,
    MidiNoteOffEvent = types.MidiNoteOffEvent;

function cloneArray(array) {
   return array.subarray(0, array.length);
}

describe('midiParser', function() {

	var expect = chai.expect,
      midiData = [];

	chai.should();

	before(function(done) {
		fs.readFile(__dirname + '/minimal-valid-midi.mid', function (err, data) {
			if (err) throw new Error(err);

			midiData = new Uint8Array(data);
			done();
		});
	});

	describe('construction', function () {

		it('should not throw an error starting with a valid Midi file', function () {
			expect(function () {
				midiParser.parse(cloneArray(midiData));
			}).not.throw(Error);
		});

		describe('default construction', function () {

			var midi;

			beforeEach(function () {
				midi = midiParser.parse(cloneArray(midiData));
			});

			afterEach(function () {
				midi = null;
			});

			it('should have a valid number of tracks', function () {
				midi.tracks.length.should.equal(midi.header.trackCount);
			});

			it('should have a valid time division', function () {
				midi.header.timeDivision.should.equal(96);
			});

			it('should have a valid number of frames per second', function () {
				midi.header.isFramesPerSecond.should.be.true;
			});

			describe('MidiTrack', function () {
				var midiTrack;

				describe('Tempo', function () {

					beforeEach(function () {
						midiTrack = midi.tracks[0];
					});

					afterEach(function () {
						midiTrack = null;
					});

					it('should have 3 events', function () {
						midiTrack.events.length.should.equal(3);
					});

					it('should have a tempo event', function () {
						midiTrack.events[0].subtype.should.equal('tempo');
						midiTrack.events[0].tempo.should.equal(1000000);
					});

					it('should have a time signature event', function () {
						midiTrack.events[1].subtype.should.equal('time_signature');
						midiTrack.events[1].timeSignature.numerator.should.equal(4);
						midiTrack.events[1].timeSignature.denominator.should.equal(4);
						midiTrack.events[1].timeSignature.metronomeClicksPerTick.should.equal(24);
						midiTrack.events[1].timeSignature.thirtySecondNotesPerBeat.should.equal(8);
					});

					it('should have an end event', function () {
						midiTrack.events[2].subtype.should.equal('end');
					});
				});

				describe('Instrument', function () {

					beforeEach(function () {
						midiTrack = midi.tracks[1]; // bass-drum, half-note track
					});

					afterEach(function () {
						midiTrack = null;
					});

					it('should have an instrument name');//, function () {
					// midiTrack.instrumentName.should.equal('01');
					// });

					describe('Events', function () {
						var events;

						beforeEach(function () {
							events = midiTrack.events;
						});

						afterEach(function () {
							events = null;
						});

						it('should have thirty-four events', function() {
                     // 1 instrument-name
                     // 16 note-on
                     // 16 note-off
                     // 1 end-of-track
							events.length.should.equal(34);
						});

						it('should have equal number of on/off events', function () {
							var noteOnFilter = function (event) { return event instanceof MidiNoteOnEvent; },
								noteOffFilter = function (event) { return event instanceof MidiNoteOffEvent; };

							events.filter(noteOnFilter).length.should.equal(events.filter(noteOffFilter).length);
						});

                  it('should track the length of a note', function () {
                     var onNotes = events.filter(function (event) { return event instanceof MidiNoteOnEvent; });

                     onNotes.forEach(function (event) {
                        // NOTE: if song is 60bpm, that corresponds to
                        //          - tempo = 1,000,000
                        //          - timeDivision = 96
                        //          - noteLength (in midi ticks) = 48
                        //
                        //       60,000,000 / 1,000,000 = 60 (quarter notes per minute, aka 60bpm)
                        //       1,000,000 / 96 = 10,416.6667 (microseconds per tick)
                        //       10,416.6667 * 24 = 250,000 (microseconds between note start)
                        //       250,000 / 1,000 = 250 (milliseconds between previous note start)
                        //
                        //       250ms is length of 16th note when tempo is 60bpm
                        
                        event.length.should.equal(24);
                     });
                  });

						it('TODO: more events....');
					});
				});
			});
		});
	});

});
