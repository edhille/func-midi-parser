'use strict';

function subclass(SubClass, BaseClass) {
	if (BaseClass) {
		SubClass.prototype = Object.create(BaseClass.prototype);
	} else {
		SubClass.prototype = Object.create(null);
	}

	SubClass.prototype.constructor = SubClass;
}

function Midi(header, tracks) {
	this.header = header || new MidiTrack({});
	this.tracks = tracks || [];

	if (Object.freeze) {
		Object.freeze(this);
		Object.freeze(this.tracks);
	}
}

subclass(Midi);

function MidiHeader(params) {
	this.format = params.format;
	this.trackCount = params.trackCount;
	this.timeDivision = params.timeDivision;
	this.isTicksPerBeat = Boolean(0x8000 & this.timeDivision);
	this.isFramesPerSecond = !this.isTicksPerBeat;

	if (Object.freeze) Object.freeze(this);
}

subclass(MidiHeader);

function MidiTrack(events, name) {
	this.events = events;
	this.name = name || '';

	if (Object.freeze) Object.freeze(this);
}

subclass(MidiTrack);

function MidiEvent(params) {
	this.code = params.code;
	// TODO: do we need "type"/"subtype" if we have class-types?
	this.type = params.type;
	this.subtype = params.subtype;
	this.delta = params.delta;
	this.track = params.track;

	if (Object.freeze) Object.freeze(this);
}

subclass(MidiEvent);

/*
 * Meta Events
 */

function MidiMetaEvent(params) {
	params.type = 'meta';
	params.subtype = params.subtype || 'unknown';

	MidiEvent.call(this, params);
}

subclass(MidiMetaEvent, MidiEvent);

function MidiMetaTempoEvent(params) {
	if (!params || !params.microsecPerQn) throw new TypeError('must provide "microsecPerQn"');

	this.microsecPerQn = params.microsecPerQn;

	params.subtype = 'tempo';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaTempoEvent, MidiMetaEvent);

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

subclass(MidiMetaTimeSignatureEvent, MidiMetaEvent);

function MidiMetaInstrumentNameEvent(params) {
	this.instrumentName = params.name;

	params.subtype = 'instrument_name';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaInstrumentNameEvent, MidiMetaEvent);

function MidiMetaKeySignatureEvent(params) {
	this.key = params.key;
	this.sf = params.sf;
	this.mi = params.mi;

	params.subtype = 'key_signature';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaKeySignatureEvent, MidiMetaEvent);

function MidiMetaSmpteOffsetEvent(params) {
	this.frameRate = params.frameRate;
	this.min = params.min;
	this.sec = params.sec;
	this.frames = params.frames;
	this.subframes = params.subframes;

	params.subtype = 'smpte_offset';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaSmpteOffsetEvent, MidiMetaEvent);

function MidiMetaTrackNameEvent(params) {
	this.trackName = params.name;

	params.subtype = 'track_name';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaTrackNameEvent, MidiMetaEvent);

function MidiMetaEndOfTrackEvent(params) {
	params.subtype = 'end';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaEndOfTrackEvent, MidiMetaEvent);

/*
 * System Events
 */

function MidiSystemEvent(params) {
	params.type = 'system';

	MidiEvent.call(this, params);
}

subclass(MidiSystemEvent, MidiEvent);

/*
 * Channel Events
 */

function MidiChannelEvent(params) {
	this.type = 'channel';
	this.channel = params.eventCode & 0x0f;

	MidiMetaEvent.call(this, params);
}

subclass(MidiChannelEvent, MidiEvent);

function MidiPolyphonicAftertouchEvent(params) {
	params.subtype = 'polyphonic-aftertouch';

	this.note = params.note;
	this.pressure = params.pressure;

	MidiChannelEvent.call(this, params);
}

subclass(MidiPolyphonicAftertouchEvent, MidiChannelEvent);

function MidiControlChangeEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

subclass(MidiControlChangeEvent, MidiChannelEvent);

function MidiProgramChangeEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

subclass(MidiProgramChangeEvent, MidiChannelEvent);

function MidiChannelAftertouchEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

subclass(MidiChannelAftertouchEvent, MidiChannelEvent);

function MidiPitchWheelEvent(params) {
	// TODO: what data is specific here?

	MidiChannelEvent.call(this, params);
}

subclass(MidiPitchWheelEvent, MidiChannelEvent);

/*
 * Note Events
 */

function MidiNoteEvent(params) {
	params.type = 'note';

	this.note = params.note;
	this.velocity = params.velocity;
	this.length = params.length;

	MidiEvent.call(this, params);
}

subclass(MidiNoteEvent, MidiChannelEvent);

function MidiNoteOnEvent(params) {
	params.subtype = 'on';

	MidiNoteEvent.call(this, params);
}

subclass(MidiNoteOnEvent, MidiNoteEvent);

function MidiNoteOffEvent(params) {
	params.subtype = 'off';

	MidiNoteEvent.call(this, params);
}

subclass(MidiNoteOffEvent, MidiNoteEvent);

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
