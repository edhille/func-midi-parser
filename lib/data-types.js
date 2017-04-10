'use strict';

/**
 * @module MidiTypes
 */

const createDataType = require('fadt');

/**
 * @class Midi
 * @description top-level data type representing entire Midi song
 * @param {object} params - properties to set
 * @param {MidiHeader} params.header - header data
 * @param {MidiTrack[]} params.tracks - array of MidiTracks
 * @returns Midi
 */
const Midi = createDataType(function (params) {
	this.header = params.header || new MidiHeader({});
	this.tracks = params.tracks || [];
});

/**
 * @class MidiHeader
 * @description header information for Midi song
 * @param {object} params - properties to set
 * @param {number} params.format - (0: single-track, 1: multi-track, simultaneous, 2: multi-track, independent)
 * @param {number} params.trackCount - number of tracks (if multi-track)
 * @param {timeDivision} params.timeDivision - the default unit of delta-time for this MIDI file
 * @return MidiHeader
 */
const MidiHeader = createDataType(function (params) {
	this.format = params.format;
	this.trackCount = params.trackCount;
	this.timeDivision = params.timeDivision;
	this.isTicksPerBeat = Boolean(0x8000 & this.timeDivision);
	this.isFramesPerSecond = !this.isTicksPerBeat;
});

/**
 * @class MidiTrack
 * @description information for a given track
 * @param {object} params - properties to set
 * @param {string} [params.name=''] - label for the track
 * @param {MidiEvent[]} [params.events=[]] - array of MidiEvents
 * @return MidiTrack
 */
const MidiTrack = createDataType(function (params) {
	this.events = params.events || [];
	this.name = params.name || '';
});

/**
 * @class MidiEvent
 * @description Abstract midi event class
 * @param {object} params - properties to set
 * @param {number} params.code - 0x80-0xFF code for the event
 * @param {string} params.type - string label for the top-level "type" of event
 * @param {string} params.subtype - string label for the second-level "type" of event
 * @param {number} params.track - the index for the track this event belongs to
 * @param {number} [params.delta=0] -  delta offset in ??? (microseconds or milliseconds) from previous event
 * @return MidiEvent
 */
const MidiEvent = createDataType(function (params) {
	this.code = params.code;
	// TODO: do we need "type"/"subtype" if we have class-types?
	this.type = params.type;
	this.subtype = params.subtype;
	this.delta = params.delta;
	this.track = params.track;
});

/*
 * Meta Events
 */

/**
 * @class MidiMetaEvent
 * @description Abstract Midi meta event
 * @param {object} params - properties to set
 * @param {string} params.subtype - the type of meta event (i.e. "tempo", "time_signature", etc.)
 * @return MidiMetaEvent
 */
const MidiMetaEvent = createDataType(function (params) {
	params.type = 'meta';
	params.subtype = params.subtype || 'unknown';
}, MidiEvent);

/**
 * @class MidiMetaTempoEvent
 * @description Meta tempo event
 * @param {object} params - properties to set
 * @param {number} params.microsecPerQn - microseconds per quarter note
 * @return MidiMetaTempoEvent
 */
const MidiMetaTempoEvent = createDataType(function (params) {
	if (!params || !params.microsecPerQn) throw new TypeError('must provide "microsecPerQn"');

	this.microsecPerQn = params.microsecPerQn;

	this.subtype = 'tempo';
}, MidiMetaEvent);

/**
 * @class MidiMetaTimeSignatureEvent
 * @description Meta time signature event. Expects time signature to be
 *              represented by two numbers that take the form: nn/2^dd
 * @param {object} params - properties to set
 * @param {number} params.numerator - numerator for time signature
 * @param {number} params.denominator - exponent for denominator of time signature
 * @param {number} params.metronomeClicksPerTick - number of metronome clicks per midi tick
 * @param {number} params.thirtySecondNotesPerBeat - number of 1/32 notes per beat
 * @return MidiMetaTimeSignature
 */
const MidiMetaTimeSignatureEvent = createDataType(function (params) {
	this.timeSignature = {
		numerator: params.numerator,
		denominator: params.denominator,
		metronomeClicksPerTick: params.metronomeClicksPerTick,
		thirtySecondNotesPerBeat: params.thirtySecondNotesPerBeat
	};

	if (Object.freeze) Object.freeze(this.timeSignature);

	this.subtype = 'time_signature';
}, MidiMetaEvent);

/**
 * @class MidiMetaInstrumentNameEvent
 * @description Midi meta instrument name event
 * @param {object} params - proprties to set
 * @param {string} params.name - name of instrument used
 * @return MidiMetaInstrumentNameEvent
 */
const MidiMetaInstrumentNameEvent = createDataType(function (params) {
	this.instrumentName = params.name;

	this.subtype = 'instrument_name';
}, MidiMetaEvent);

/**
 * @class MidiMetaKeySignatureEvent
 * @description Midi meta key signature event
 * @param {object} params - properties to set
 * @param {number} params.sf - number of sharps/flats (-7 <= sf <= 7)
 * @param {number} params.mi - major (0) or minor (1)
 * @return MidiMetaKeySignatureEvent
 */
const MidiMetaKeySignatureEvent = createDataType(function (params) {
	this.sf = params.sf;
	this.mi = params.mi;

	this.subtype = 'key_signature';
}, MidiMetaEvent);

/**
 * @class MidiMetaSmptOffsetEvent
 * @description Midi meta smpte offset event
 * @param {object} params - properties to set
 * @param {number} params.frameRate - top two bits define the frame rate in frames per second. If those bits are "00" (0
 * decimal), the frame rate is 24 frames per second. If those bits are "01" (1 decimal), the frame rate is 25 frames per second.
 * If the bits are "10" (2 decimal), the frame rate is "drop 30" or 29.97 frames per second. If the top two bits are "11", then
 * the frame rate is 30 frames per second. The six remaining bits define the hours of the SMPTE time (0-23).
 * @param {number} params.min - minutes in offset (0-59)
 * @param {number} params.sec - seconds in offset (0-59)
 * @param {number} params.frames - depends upon framerate
 * @param {number} params.subframes - 0-99
 * @return MidiMeatSmpteOffsetEvent
 */
const MidiMetaSmpteOffsetEvent = createDataType(function (params) {
	this.frameRate = params.frameRate;
	this.min = params.min;
	this.sec = params.sec;
	this.frames = params.frames;
	this.subframes = params.subframes;

	this.subtype = 'smpte_offset';
}, MidiMetaEvent);

/**
 * @class MidiMetaTrackNameEvent
 * @description Midi meta track name event
 * @param {object} params - properties to set
 * @param {string} params.name - name of the track
 * @return MidiMetaTrackNameEvent
 */
const MidiMetaTrackNameEvent = createDataType(function (params) {
	this.trackName = params.name;

	this.subtype = 'track_name';
}, MidiMetaEvent);

/**
 * @class MidiMetaEndOfTrack
 * @description Midi meta end of track event
 * @return MidiMetaEndOfTrackEvent
 */
const MidiMetaEndOfTrackEvent = createDataType(function (/* params */) {
	this.subtype = 'end';
}, MidiMetaEvent);

/*
 * System Events
 */

/**
 * @class MidiSystemEvent
 * @description Abstract Midi system event
 * @return MidiSystemEvent
 */
const MidiSystemEvent = createDataType(function (/* params */) {
	this.type = 'system';
}, MidiEvent);

/*
 * Channel Events
 */

/**
 * @class MidiChannelEvent
 * @description Abstract Midi channel event
 * @param {object} params - properties to set
 * @param {number} params.eventCode - hex value for the event code (0x80-0xEF)
 * @return MidiChannelEvent
 */
const MidiChannelEvent = createDataType(function (params) {
	this.channel = params.eventCode & 0x0f;
}, MidiEvent);

/**
 * @class MidiPolyphonicAftertouchEvent
 * @description polyphonic aftertouch event
 * @param {object} params - proprties to set
 * @return MidiPolyphonicAftertouchEvent
 */
const MidiPolyphonicAftertouchEvent = createDataType(function (params) {
	this.subtype = 'polyphonic-aftertouch';

	this.note = params.note;
	this.pressure = params.pressure;
}, MidiChannelEvent);

/**
 * @class MidiControlChangeEvent
 * @description control change event
 * @param {object} params - proprties to set
 * @return MidiControlChangeEvent
 */
const MidiControlChangeEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

/**
 * @class MidiProgramChangeEvent
 * @description NOT YET IMPLEMENTED
 * @param {object} params - proprties to set
 * @return MidiProgramChangeEvent
 */
const MidiProgramChangeEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

/**
 * @class MidiChannelAftertouchEvent
 * @description NOT YET IMPLEMENTED
 * @param {object} params - proprties to set
 * @return MidiChannelAftertouchEvent
 */
const MidiChannelAftertouchEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

/**
 * @class MidiPitchWheelEvent
 * @description NOT YET IMPLEMENTED
 * @param {object} params - proprties to set
 * @return MidiPitchWheelEvent
 */
const MidiPitchWheelEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

/*
 * Note Events
 */

/**
 * @class MidiNoteEvent
 * @description Abstract note event
 * @param {object} params - proprties to set
 * @param {number} params.note - note (0-255)
 * @param {number} params.velocity - velocity (0-127)
 * @param {number} params.length - length in ms
 * @return MidiNoteEvent
 */
const MidiNoteEvent = createDataType(function (params) {
	this.type = 'note';

	this.note = params.note;
	this.velocity = params.velocity;
	this.length = params.length;
}, MidiChannelEvent);

/**
 * @class MidiNoteOnEvent
 * @description note on event
 * @return MidiNoteOnEvent
 */
const MidiNoteOnEvent = createDataType(function (/* params */) {
	this.subtype = 'on';
}, MidiNoteEvent);

/**
 * @class MidiNoteOffEvent
 * @description note off event
 * @return MidiNoteOffEvent
 */
const MidiNoteOffEvent = createDataType(function (/* params */) {
	this.subtype = 'off';
}, MidiNoteEvent);

module.exports = {
	Midi: Midi,
	MidiHeader: MidiHeader,
	MidiTrack: MidiTrack,
	MidiEvent: MidiEvent,
	MidiMetaEvent: MidiMetaEvent,
	MidiMetaTempoEvent: MidiMetaTempoEvent,
	MidiMetaTimeSignatureEvent: MidiMetaTimeSignatureEvent,
	MidiMetaInstrumentNameEvent: MidiMetaInstrumentNameEvent,
	MidiMetaTrackNameEvent: MidiMetaTrackNameEvent,
	MidiMetaKeySignatureEvent: MidiMetaKeySignatureEvent,
	MidiMetaSmpteOffsetEvent: MidiMetaSmpteOffsetEvent,
	MidiMetaEndOfTrackEvent: MidiMetaEndOfTrackEvent,
	MidiSystemEvent: MidiSystemEvent,
	MidiChannelEvent: MidiChannelEvent,
	MidiNoteEvent: MidiNoteEvent,
	MidiNoteOnEvent: MidiNoteOnEvent,
	MidiNoteOffEvent: MidiNoteOffEvent,
	MidiPolyphonicAftertouchEvent: MidiPolyphonicAftertouchEvent,
	MidiControlChangeEvent: MidiControlChangeEvent,
	MidiProgramChangeEvent: MidiProgramChangeEvent,
	MidiChannelAftertouchEvent: MidiChannelAftertouchEvent,
	MidiPitchWheelEvent: MidiPitchWheelEvent
};
