'use strict';

var ADT = require('fadt');

function Midi(header, tracks) {
	this.header = header || new MidiTrack({});
	this.tracks = tracks || [];

	ADT.call(this);
}

ADT.inherit(Midi, ADT);

function MidiHeader(params) {
	this.format = params.format;
	this.trackCount = params.trackCount;
	this.timeDivision = params.timeDivision;
	this.isTicksPerBeat = Boolean(0x8000 & this.timeDivision);
	this.isFramesPerSecond = !this.isTicksPerBeat;

	ADT.call(this);
}

ADT.inherit(MidiHeader, ADT);

function MidiTrack(events, name) {
	this.events = events;
	this.name = name || '';

	ADT.call(this);
}

ADT.inherit(MidiTrack, ADT);

function MidiEvent(params) {
	this.code = params.code;
	// TODO: do we need "type"/"subtype" if we have class-types?
	this.type = params.type;
	this.subtype = params.subtype;
	this.delta = params.delta;
	this.track = params.track;

	ADT.call(this);
}

ADT.inherit(MidiEvent, ADT);

/*
 * Meta Events
 */

function MidiMetaEvent(params) {
	params.type = 'meta';
	params.subtype = params.subtype || 'unknown';

	MidiEvent.call(this, params);
}

ADT.inherit(MidiMetaEvent, MidiEvent);

function MidiMetaTempoEvent(params) {
	if (!params || !params.microsecPerQn) throw new TypeError('must provide "microsecPerQn"');

	this.microsecPerQn = params.microsecPerQn;

	params.subtype = 'tempo';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaTempoEvent, MidiMetaEvent);

function MidiMetaTimeSignatureEvent(params) {
	this.timeSignature = {
		numerator: params.numerator,
		denominator: params.denominator,
		metronomeClicksPerTick: params.metronomeClicksPerTick,
		thirtySecondNotesPerBeat: params.thirtySecondNotesPerBeat
	};

	if (Object.freeze) Object.freeze(this.timeSignature);

	params.subtype = 'time_signature';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaTimeSignatureEvent, MidiMetaEvent);

function MidiMetaInstrumentNameEvent(params) {
	this.instrumentName = params.name;

	params.subtype = 'instrument_name';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaInstrumentNameEvent, MidiMetaEvent);

function MidiMetaKeySignatureEvent(params) {
	this.key = params.key;
	this.sf = params.sf;
	this.mi = params.mi;

	params.subtype = 'key_signature';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaKeySignatureEvent, MidiMetaEvent);

function MidiMetaSmpteOffsetEvent(params) {
	this.frameRate = params.frameRate;
	this.min = params.min;
	this.sec = params.sec;
	this.frames = params.frames;
	this.subframes = params.subframes;

	params.subtype = 'smpte_offset';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaSmpteOffsetEvent, MidiMetaEvent);

function MidiMetaTrackNameEvent(params) {
	this.trackName = params.name;

	params.subtype = 'track_name';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaTrackNameEvent, MidiMetaEvent);

function MidiMetaEndOfTrackEvent(params) {
	params.subtype = 'end';

	MidiMetaEvent.call(this, params);
}

ADT.inherit(MidiMetaEndOfTrackEvent, MidiMetaEvent);

/*
 * System Events
 */

function MidiSystemEvent(params) {
	params.type = 'system';

	MidiEvent.call(this, params);
}

ADT.inherit(MidiSystemEvent, MidiEvent);

/*
 * Channel Events
 */

function MidiChannelEvent(params) {
	this.channel = params.eventCode & 0x0f;

	MidiEvent.call(this, params);
}

ADT.inherit(MidiChannelEvent, MidiEvent);

function MidiPolyphonicAftertouchEvent(params) {
	params.subtype = 'polyphonic-aftertouch';

	this.note = params.note;
	this.pressure = params.pressure;

	MidiChannelEvent.call(this, params);
}

ADT.inherit(MidiPolyphonicAftertouchEvent, MidiChannelEvent);

function MidiControlChangeEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

ADT.inherit(MidiControlChangeEvent, MidiChannelEvent);

function MidiProgramChangeEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

ADT.inherit(MidiProgramChangeEvent, MidiChannelEvent);

function MidiChannelAftertouchEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

ADT.inherit(MidiChannelAftertouchEvent, MidiChannelEvent);

function MidiPitchWheelEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

ADT.inherit(MidiPitchWheelEvent, MidiChannelEvent);

/*
 * Note Events
 */

function MidiNoteEvent(params) {
	params.type = 'note';

	this.note = params.note;
	this.velocity = params.velocity;
	this.length = params.length;

	MidiChannelEvent.call(this, params);
}

ADT.inherit(MidiNoteEvent, MidiChannelEvent);

function MidiNoteOnEvent(params) {
	params.subtype = 'on';

	MidiNoteEvent.call(this, params);
}

ADT.inherit(MidiNoteOnEvent, MidiNoteEvent);

function MidiNoteOffEvent(params) {
	params.subtype = 'off';

	MidiNoteEvent.call(this, params);
}

ADT.inherit(MidiNoteOffEvent, MidiNoteEvent);

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
