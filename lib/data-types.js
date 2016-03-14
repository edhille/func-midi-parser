'use strict';

/**
 * @module MidiTypes
 */

var createDataType = require('fadt');

/**
 * @class Midi
 * @description top-level data type representing entire Midi song
 * @param {object} params - properties to set
 * @param {MidiHeader} params.header - header data
 * @param {MidiTrack[]} params.tracks - array of MidiTracks
 * @returns Midi
 */
var Midi = createDataType(function (params) {
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
var MidiHeader = createDataType(function (params) {
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
var MidiTrack = createDataType(function (params) {
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
var MidiEvent = createDataType(function (params) {
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

var MidiMetaEvent = createDataType(function (params) {
	params.type = 'meta';
	params.subtype = params.subtype || 'unknown';
}, MidiEvent);

var MidiMetaTempoEvent = createDataType(function (params) {
	if (!params || !params.microsecPerQn) throw new TypeError('must provide "microsecPerQn"');

	this.microsecPerQn = params.microsecPerQn;

	this.subtype = 'tempo';
}, MidiMetaEvent);

var MidiMetaTimeSignatureEvent = createDataType(function (params) {
	this.timeSignature = {
		numerator: params.numerator,
		denominator: params.denominator,
		metronomeClicksPerTick: params.metronomeClicksPerTick,
		thirtySecondNotesPerBeat: params.thirtySecondNotesPerBeat
	};

	if (Object.freeze) Object.freeze(this.timeSignature);

	this.subtype = 'time_signature';
}, MidiMetaEvent);

var MidiMetaInstrumentNameEvent = createDataType(function (params) {
	this.instrumentName = params.name;

	this.subtype = 'instrument_name';
}, MidiMetaEvent);

var MidiMetaKeySignatureEvent = createDataType(function (params) {
	this.key = params.key;
	this.sf = params.sf;
	this.mi = params.mi;

	this.subtype = 'key_signature';
}, MidiMetaEvent);

var MidiMetaSmpteOffsetEvent = createDataType(function (params) {
	this.frameRate = params.frameRate;
	this.min = params.min;
	this.sec = params.sec;
	this.frames = params.frames;
	this.subframes = params.subframes;

	this.subtype = 'smpte_offset';
}, MidiMetaEvent);

var MidiMetaTrackNameEvent = createDataType(function (params) {
	this.trackName = params.name;

	this.subtype = 'track_name';
}, MidiMetaEvent);

var MidiMetaEndOfTrackEvent = createDataType(function (/* params */) {
	this.subtype = 'end';
}, MidiMetaEvent);

/*
 * System Events
 */

var MidiSystemEvent = createDataType(function (/* params */) {
	this.type = 'system';
}, MidiEvent);

/*
 * Channel Events
 */

var MidiChannelEvent = createDataType(function (params) {
	this.channel = params.eventCode & 0x0f;
}, MidiEvent);

var MidiPolyphonicAftertouchEvent = createDataType(function (params) {
	this.subtype = 'polyphonic-aftertouch';

	this.note = params.note;
	this.pressure = params.pressure;
}, MidiChannelEvent);

var MidiControlChangeEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

var MidiProgramChangeEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

var MidiChannelAftertouchEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

var MidiPitchWheelEvent = createDataType(function (/* params */) {
	// TODO: what data is specific here?
}, MidiChannelEvent);

/*
 * Note Events
 */

var MidiNoteEvent = createDataType(function (params) {
	this.type = 'note';

	this.note = params.note;
	this.velocity = params.velocity;
	this.length = params.length;
}, MidiChannelEvent);

var MidiNoteOnEvent = createDataType(function (/* params */) {
	this.subtype = 'on';
}, MidiNoteEvent);

var MidiNoteOffEvent = createDataType(function (/* params */) {
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
