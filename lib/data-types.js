'use strict';

var createDataType = require('fadt');

var Midi = createDataType(function (params) {
	this.header = params.header || new MidiTrack({});
	this.tracks = params.tracks || [];
});

var MidiHeader = createDataType(function (params) {
	this.format = params.format;
	this.trackCount = params.trackCount;
	this.timeDivision = params.timeDivision;
	this.isTicksPerBeat = Boolean(0x8000 & this.timeDivision);
	this.isFramesPerSecond = !this.isTicksPerBeat;
});

var MidiTrack = createDataType(function (params) {
	this.events = params.events || [];
	this.name = params.name || '';
});

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
