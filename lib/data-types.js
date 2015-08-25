'use strict';

var midiUtils = require('./midi-utils.js');
var parseByteArrayToNumber = midiUtils.parseByteArrayToNumber;

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
	if (!params || !params.tempo) throw new TypeError('must provide "tempo"');

	this.tempo = params.tempo;

	params.subtype = 'tempo';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaTempoEvent, MidiMetaEvent);

function MidiMetaTimeSignatureEvent(params) {
	this.timeSignature = {
		numerator: params.dataBytes[0],
		denominator: Math.pow(2, params.dataBytes[1]),
		metronomeClicksPerTick: params.dataBytes[2],
		thirtySecondNotesPerBeat: params.dataBytes[3]
	};

	if (Object.freeze) Object.freeze(this.timeSignature);

	params.subtype = 'time_signature';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaTimeSignatureEvent, MidiMetaEvent);

function MidiMetaInstrumentNameEvent(params) {
	this.instrumentName = params.dataBytes.map(function(charCode) {
		return String.fromCharCode(charCode);
	}).join('');

	params.subtype = 'instrument_name';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaInstrumentNameEvent, MidiMetaEvent);

function MidiMetaKeySignatureEvent(params) {
	// TODO: is this correct?
	this.keySignature = params.dataBytes.map(function(charCode) {
		return String.fromCharCode(charCode);
	}).join('');

	params.subtype = 'key_signature';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaKeySignatureEvent, MidiMetaEvent);

function MidiMetaSmpteOffsetEvent(params) {
	// TODO: correctly handle this data
	/*
		This message consists of eight bytes of data. The first byte is the 
		status byte 0xFF, which shows that this is a meta message. The second 
		byte is the meta message type 0x54, which shows that this is the SMPTE 
		offset meta message. The third byte is 0x05, which shows that there 
		are five remaining bytes. The fourth byte specifies the hours of the 
		SMPTE time and the frame rate as described below. The fifth, sixth, 
		seventh, and eighth bytes specify the minutes, seconds, frames, and 
		sub-frames of the SMPTE time.

		The hours byte has the binary format "sshhhhhh". The top two bits ss 
		define the frame rate in frames per second. If those bits are "00" 
		(0 decimal), the frame rate is 24 frames per second. If those bits 
		are "01" (1 decimal), the frame rate is 25 frames per second. If the 
		bits are "10" (2 decimal), the frame rate is "drop 30" or 29.97 frames 
		per second. If the top two bits are "11", then the frame rate is 30 
		frames per second. The six hhhhhh bits define the hours of the SMPTE 
		time.

		Obviously, the hour byte of the SMPTE time takes values between 0 and 
		23. The minute and second bytes of the SMPTE time take values between 
		0 and 59. The frame byte takes values which range depends on the frame 
		rate specified in the hour byte. For example, if the frame rate is 24 
		frames per second, then the frame byte takes values between 0 and 23. 
		The sub-frame byte takes values between 0-99 as there are always 100 
		sub-frames in a frame.

		The following is an example of a MIDI SMPTE offset meta message.

		0xFF 0x54 0x05 0x01 0x00 0x00 0x00 0x00

		The status byte is 0xFF which means that this is a meta message. The 
		meta message type is 0x54 which means that this is the SMPTE offset 
		meta message. The third byte shows that 5 bytes follow. The fourth byte 
		is 0x01 which has the binary form 00000001 and hence the frame rate is 
		"00" or 24 frames per second. The SMPTE hours are 1. The remaining 
		bytes define the SMPTE minutes, seconds, frames, and sub-frames as 0. 
		Thus this message means that the track should start 1 hour after the 
		beginning of the sequence.
	*/
	this.smpteOffset = params.dataBytes.map(function(charCode) {
		return String.fromCharCode(charCode);
	}).join('');

	params.subtype = 'smpte_offset';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaSmpteOffsetEvent, MidiMetaEvent);

function MidiMetaTrackNameEvent(params) {
	this.trackName = params.dataBytes.map(function(charCode) {
		return String.fromCharCode(charCode);
	}).join('');


	params.subtype = 'trackName';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaTrackNameEvent, MidiMetaEvent);

function MidiMetaEndOfTrackEvent(params) {
	params.subtype = 'end';

	MidiMetaEvent.call(this, params);
}

subclass(MidiMetaEndOfTrackEvent, MidiMetaEvent);

function MidiChannelEvent(params) {
	params.subtype = 'controller';

	this.channel = params.channel;
	this.controllerType = params.dataBytes[0];
	this.value = params.dataBytes[1];

	MidiMetaEvent.call(this, params);
}

subclass(MidiChannelEvent, MidiEvent);

/*
 * System Events
 */

function MidiSystemEvent(params) {
	params.type = 'system';

	MidiEvent.call(this, params);
}

subclass(MidiSystemEvent, MidiEvent);

/*
 * Note Events
 */

function MidiNoteEvent(params) {
	params.type = 'note';

	this.channel = params.channel;
	this.note = params.note;
	this.velocity = params.velocity;
	this.length = params.length;

	MidiEvent.call(this, params);
}

subclass(MidiNoteEvent, MidiEvent);

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
	MidiNoteEvent: MidiNoteEvent,
	MidiNoteOnEvent: MidiNoteOnEvent,
	MidiNoteOffEvent: MidiNoteOffEvent,
	MidiChannelEvent: MidiChannelEvent
};

