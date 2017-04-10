/* eslint node: true */
/* globals describe: true, before: true, beforeEach: true, afterEach: true, it: true, Uint8Array: true */
'use strict';

const fs = require('fs');
const chai = require('chai');
const midiParser = require('../index.js');
const {
	types: {
		MidiNoteOnEvent,
		MidiNoteOffEvent
	}
} = midiParser;

function cloneArray(array) {
	return array.subarray(0, array.length);
}

describe('midiParser', () => {

	const expect = chai.expect;
	let midiData = [];

	chai.should();

	describe('parsing invalid midi', () => {

		function shouldThrowFor(errorRegExp, filename, done) {
			fs.readFile(__dirname + '/sounds/' + filename, (err, data) => {
				if (err) throw new Error(err);

				midiData = new Uint8Array(data);

				expect(() => midiParser.parse(cloneArray(midiData)) ).throw(errorRegExp);

				done();
			});
		}

		describe('with a bad header chunk', () => {

			it('should throw an error', (done) => {
				shouldThrowFor(/malformed midi: could not find "MThd"/, 'MIDIBadHeaderChunk.mid', done);
			});
		});

		describe('with a bad header format', () => {

			it('should throw an error', (done) => {
				shouldThrowFor(/malformed midi: unknown format \(3\)/, 'MIDIBadHeaderFormat.mid', done);
			});
		});
	});

	describe('parsing minimal valid midi', () => {

		before((done) => {
			fs.readFile(__dirname + '/sounds/minimal-valid-midi.mid', (err, data) => {
				if (err) throw new Error(err);

				midiData = new Uint8Array(data);
				done();
			});
		});

		describe('construction', () => {

			it('should not throw an error starting with a valid Midi file', function () {
				midiParser.parse(cloneArray(midiData));
				expect(() => midiParser.parse(cloneArray(midiData)) ).not.throw(Error);
			});

			describe('default construction', () => {

				let midi;

				beforeEach(() => midi = midiParser.parse(cloneArray(midiData)) );

				afterEach(() => midi = null );

				it('should have a valid number of tracks', () => {
					midi.tracks.length.should.equal(midi.header.trackCount);
				});

				it('should have a valid time division', () => {
					midi.header.timeDivision.should.equal(96);
				});

				it('should have a valid number of frames per second', () => {
					midi.header.isFramesPerSecond.should.be.true;
				});

				describe('MidiTrack', () => {
					let midiTrack;

					describe('Tempo', () => {

						beforeEach(() => midiTrack = midi.tracks[0] );

						afterEach(() => midiTrack = null );

						it('should have 3 events', () => {
							midiTrack.events.length.should.equal(3);
						});

						it('should have a tempo event', () => {
							midiTrack.events[0].subtype.should.equal('tempo');
							midiTrack.events[0].microsecPerQn.should.equal(1000000);
						});

						it('should have a time signature event', () => {
							midiTrack.events[1].subtype.should.equal('time_signature');
							midiTrack.events[1].timeSignature.numerator.should.equal(4);
							midiTrack.events[1].timeSignature.denominator.should.equal(4);
							midiTrack.events[1].timeSignature.metronomeClicksPerTick.should.equal(24);
							midiTrack.events[1].timeSignature.thirtySecondNotesPerBeat.should.equal(8);
						});

						it('should have an end event', () => {
							midiTrack.events[2].subtype.should.equal('end');
						});
					});

					describe('Instrument', () => {

						beforeEach(() => {
							midiTrack = midi.tracks[1]; // bass-drum, half-note track
						});

						afterEach(() => midiTrack = null );

						it('should have an instrument name', () =>{
							midiTrack.name.should.equal('01');
						});

						describe('Events', () => {
							let events;

							beforeEach(() => events = midiTrack.events );

							afterEach(() => events = null );

							it('should have thirty-four events', () => {
								// 1 instrument-name
								// 16 note-on
								// 16 note-off
								// 1 end-of-track
								events.length.should.equal(34);
							});

							it('should have equal number of on/off events', () => {
								const noteOnFilter = (event) => { event instanceof MidiNoteOnEvent; };
								const noteOffFilter = (event) => { event instanceof MidiNoteOffEvent; };

								events.filter(noteOnFilter).length.should.equal(events.filter(noteOffFilter).length);
							});

							it('should track the length of a note', () => {
								// 1 instrument-name
								// 2 note-on
								// 2 note-off
								// 1 end-of-track
								events.length.should.equal(6);
							});

							it('should have equal number of on/off events', () => {
								const noteOnFilter = (event) => { event instanceof MidiNoteOnEvent; };
								const noteOffFilter = (event) => { event instanceof MidiNoteOffEvent; };

								events.filter(noteOnFilter).length.should.equal(events.filter(noteOffFilter).length);
							});

							it('should track the length of a note', () => {
								const onNotes = events.filter((event) => event instanceof MidiNoteOnEvent );

								onNotes.forEach((event) => {
									event.length.should.equal(960);
								});
							});

							it('TODO: more events....');
						});
					});
				});
			});
		});
	});

	describe('parsing real song', () => {
		let midi;

		before((done) => {
			// fs.readFile(__dirname + '/sounds/real-song.mid', function (err, data) {
			fs.readFile(__dirname + '/sounds/Vunderbar.mid', (err, data) => {
				if (err) throw new Error(err);

				midiData = new Uint8Array(data);
				done();
			});
		});

		beforeEach(() => midi = midiParser.parse(cloneArray(midiData)) );

		it('should have 13 tracks', () => {
			midi.tracks.length.should.equal(13);
		});

		describe('tracks', () => {
			let tracks;

			function shouldHaveSameNumberOfOnAndOffEvents(track) {
				const onEvents = track.events.filter((e) => e instanceof MidiNoteOnEvent );
				const offEvents = track.events.filter((e) => e instanceof MidiNoteOffEvent);

				onEvents.length.should.equal(offEvents.length);
			}

			beforeEach(() => tracks = midi.tracks );

			it('track one should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[0]);
			});

			it('track two should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[1]);
			});

			it('track three should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[2]);
			});

			it('track four should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[3]);
			});

			it('track five should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[4]);
			});

			it('track five should have first note starting with a delta of 32880', () => {
				const firstNoteOnEvent = tracks[4].events.filter((event) => event instanceof MidiNoteOnEvent )[0];

				firstNoteOnEvent.delta.should.equal(32880);
			});

			it('track five notes should indicate they are track 5', () => {
				const noTrackEvents = tracks[4].events.filter((event) => event.track !== 5);

				noTrackEvents.length.should.equal(0);
			});

			it('track six should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[5]);
			});

			it('track six should have first note starting with a delta of 175200', () => {
				const firstNoteOnEvent = tracks[5].events.filter((event) => event instanceof MidiNoteOnEvent )[0];

				firstNoteOnEvent.delta.should.equal(175200);
			});

			it('track seven should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[6]);
			});

			it('track eight should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[7]);
			});

			it('track nine should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[8]);
			});

			it('track ten should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[9]);
			});

			it('track eleven should have same number of note "on" and note "off" events', () => {
				shouldHaveSameNumberOfOnAndOffEvents(tracks[10]);
			});
		});
	});
});
