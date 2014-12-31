/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true */
'use strict';

var midiUtils = require('./midi-utils.js'),
    parseByteArrayToNumber = midiUtils.parseByteArrayToNumber;

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
   this.tempo = parseByteArrayToNumber(params.dataBytes);

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
   this.instrumentName = params.dataBytes.map(function (charCode) { return String.fromCharCode(charCode); }).join('');

   params.subtype = 'instrument_name';

   MidiMetaEvent.call(this, params);
}

subclass(MidiMetaInstrumentNameEvent, MidiMetaEvent);

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
    MidiMetaEndOfTrackEvent: MidiMetaEndOfTrackEvent,
    MidiNoteEvent: MidiNoteEvent,
    MidiNoteOnEvent: MidiNoteOnEvent,
    MidiNoteOffEvent: MidiNoteOffEvent,
    MidiChannelEvent: MidiChannelEvent
};
