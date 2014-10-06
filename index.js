/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
'use strict';

var utils = require('./lib/utils.js'),
    curry = utils.curry,
    splice = utils.splice,
    existy = utils.existy,
    reduce = utils.reduce;

var BYTE_MASK = utils.BYTE_MASK(),
    HIGHBIT_MASK = utils.HIGHBIT_MASK(),
    META_EVENT = utils.META_EVENT(),
    SYSEX_EVENT_MASK = utils.SYSEX_EVENT_MASK(),
    NOTE_ON_MASK = utils.NOTE_ON_MASK(),
    NOTE_OFF_MASK = utils.NOTE_OFF_MASK(),
    TEMPO_META_EVENT = utils.TEMPO_META_EVENT(),
    TIME_SIG_META_EVENT = utils.TIME_SIG_META_EVENT(),
    INST_NAME_META_EVENT = utils.INST_NAME_META_EVENT(),
    END_OF_TRACK_META_EVENT = utils.END_OF_TRACK_META_EVENT();

/* data classes */

function Midi(header, tracks) {
   this.header = header;
   this.tracks = tracks;

   if (Object.freeze) Object.freeze(this);
}

Midi.prototype = Object.create(null);

function MidiHeader(params) {
   this.format = params.format;
   this.trackCount = params.trackCount;
   this.timeDivision = params.timeDivision;
   this.isTicksPerBeat = Boolean(0x8000 & this.timeDivision);
   this.isFramesPerSecond = !this.isTicksPerBeat;
   
   if (Object.freeze) Object.freeze(this);
}

MidiHeader.prototype = Object.create(null);

function MidiTrack(events) {
   this.events = events;
   
   if (Object.freeze) Object.freeze(this);
}

MidiTrack.prototype = Object.create(null);

function MidiEvent(params) {
   this.type = params.type;
   this.delta = params.delta;
   this.data = params.data; // TODO: this is a reference and a catch-all (should go away once we flesh out the model)

   if (Object.freeze) Object.freeze(this);
}

MidiEvent.prototype = Object.create(null);

function MidiMetaEvent(params) {
   this.subtype = params.subtype || 'unknown';

   MidiEvent.call(params);
}

MidiMetaEvent.prototype = Object.create(MidiEvent);

function MidiMetaTempoEvent(params) {
   this.tempo = parseByteArrayToNumber(params.data.bytes);

   params.subtype = 'tempo';

   MidiMetaEvent.call(params);
}

MidiMetaTempoEvent.prototype = Object.create(MidiMetaEvent);

function MidiMetaTimeSignatureEvent(params) {
   this.timeSignature = {
      numerator: params.data.bytes[0],
      denominator: Math.pow(2, params.data.bytes[1]),
      metronomeClicksPerTick: params.data.bytes[2],
      thirtySecondNotesPerBeat: params.data.bytes[3]
   };

   if (Object.freeze) Object.freeze(this.timeSignature);

   params.subtype = 'time_signature';

   MidiMetaEvent.call(params);
}

MidiMetaTimeSignatureEvent.prototype = Object.create(MidiMetaEvent);

function MidiMetaInstrumentNameEvent(params) {
   this.instrumentName = params.data.bytes.map(function (charCode) { return String.fromCharCode(charCode); }).join('');

   params.subtype = 'instrument_name';

   MidiMetaEvent.call(params);
}

MidiMetaInstrumentNameEvent.prototype = Object.create(MidiMetaEvent);

function MidiMetaEndOfTrackEvent(params) {
   params.subtype = 'end';

   MidiMetaEvent.call(params);
}

MidiMetaEndOfTrackEvent.prototype = Object.create(MidiMetaEvent);

function MidiSystemEvent(params) {
   params.type = 'system';

   MidiEvent.call(params);
}

MidiSystemEvent.prototype = Object.create(MidiEvent);

function MidiNoteEvent(params) {
   params.type = 'note';

   MidiEvent.call(params);
}

MidiNoteEvent.prototype = Object.create(MidiEvent);

function MidiNoteOnEvent(params) {
   params.type = 'note';
   params.subtype = 'on';

   MidiNoteEvent.call(params);
}

MidiNoteOnEvent.prototype = Object.create(MidiNoteEvent);

function MidiNoteOffEvent(params) {
   params.type = 'note';
   params.subtype = 'off';

   MidiNoteEvent.call(params);
}

MidiNoteOffEvent.prototype = Object.create(MidiNoteEvent);

/* utilities */

function toArr(dataView, start, end) {
   return Array.apply([], dataView.subarray(start, end));
}

function parseByteArrayToNumber(byteArray, isVariable) {
   var length = byteArray.length;

   return byteArray.reduce(function _buildNumber(number, oneByte, i) {
      var rawByteValue = isVariable ? oneByte & HIGHBIT_MASK : oneByte,
          bitshiftedValue = rawByteValue << ((length-i-1) * (isVariable ? 7 : 8));
      return number + bitshiftedValue;
   }, 0);
}

function parseStringFromRawChars(charArray) {
   return charArray.map(function(c) {
      var charStr = String.fromCharCode(c);
      return charStr;
   }).join('');
}

function parseNextVariableChunk(midiBytes) {
   function variableByteChunk(bytes) {
      if (bytes.length === 0) return [];

      var nByte = bytes.shift();

      if ((nByte & BYTE_MASK) !== BYTE_MASK) return [nByte];

      return [nByte].concat(variableByteChunk(bytes));
   }

   return variableByteChunk(midiBytes.slice());
}

function matchesByteMask(testByte, byteMask) {
   return (testByte & byteMask) === byteMask;
}

function isVariableEvent(code) {
   return matchesByteMask(code, META_EVENT) || matchesByteMask(code, SYSEX_EVENT_MASK);
}

/* parsing */

function parse(midiBytes) {
   var headerOffset = 14,
       // NOTE: I would like to use UInt8Array, but it's a pain to use,
       //       so I convert it to a regular array
       header = parseHeader(toArr(midiBytes, 0, headerOffset)),
       tracks = parseTracks(toArr(midiBytes, headerOffset, midiBytes.length));

    // TODO: test this error case (need a malformed midi file)
    if (tracks.length !== header.trackCount) throw new Error('Parsed wrong number of tracks: expected (' + header.trackCount + '), but got (' + tracks.length + ')');

    return new Midi(header, tracks);
}

function parseHeader(midiBytes) {
    var chunkId = parseStringFromRawChars(midiBytes.slice(0, 4));

    if (chunkId !== 'MThd') throw new Error('malformed midi: could not find "MThd"');

    var size = parseByteArrayToNumber(midiBytes.slice(4, 8));

    if (size !== 6) throw new Error('malformed midi: unexpected header size (' + size + ')');

    var format = parseByteArrayToNumber(midiBytes.slice(8, 10));
    var trackCount = parseByteArrayToNumber(midiBytes.slice(10, 12));
    var timeDivision = parseByteArrayToNumber(midiBytes.slice(12, 14));

    return new MidiHeader({
       format: format,
       trackCount: trackCount,
       timeDivision: timeDivision
    });
}

function parseTracks(midiBytes) {
   if (midiBytes.length === 0) return [];

   var chunkIdOffset = 4,
       chunkIdBytes = midiBytes.slice(0, chunkIdOffset),
       chunkId = parseStringFromRawChars(chunkIdBytes);

   // TODO: test this (need invalid midi file)
   if (chunkId !== 'MTrk') throw new Error('Invalid header chunkId "' + chunkId + '"');

   var trackSizeOffset = chunkIdOffset + 4,
       trackSizeBytes = midiBytes.slice(chunkIdOffset, trackSizeOffset),
       trackSize = parseByteArrayToNumber(trackSizeBytes),
       eventsOffset = trackSizeOffset + trackSize,
       eventsBytes = midiBytes.slice(trackSizeOffset, eventsOffset),
       events = parseEvents(eventsBytes);

   return [new MidiTrack(events)].concat(parseTracks(midiBytes.slice(eventsOffset)));
}

function isValidEventCode(code) {
   if (matchesByteMask(code, META_EVENT)) return true;
   if (matchesByteMask(code, NOTE_ON_MASK)) return true;
   if (matchesByteMask(code, NOTE_OFF_MASK)) return true;
   if (matchesByteMask(code, SYSEX_EVENT_MASK)) return true;

   if (code) {
      console.log('Invalid code', '0x' + code.toString(16));
   } else {
      console.log('NO CODE');
      throw('oh shit...');
   }

   return false;
}

function parseEvents(midiBytes, lastEventType) {
   if (midiBytes.length === 0) return [];

   console.log('parseEvents', midiBytes.length, lastEventType);

   var deltaBytes = parseNextVariableChunk(midiBytes),
       deltaTime = parseByteArrayToNumber(deltaBytes, true),
       foo = console.log(deltaBytes, deltaTime),
       eventBytes = midiBytes.slice(deltaBytes.length),
       eventCode = eventBytes.shift();

   if (!isValidEventCode(eventCode)) {
      // TODO: test this edge case (need malformed midi file)
      if (!lastEventType) throw new Error('no previous event type to use');

      eventBytes.unshift(eventCode);
      eventCode = lastEventType;
   }

   // TODO: actually have to pull out the correct number of bytes here and then pass that to a parser
   //       (otherwise, we're not really taking the correct number of bytes....)
   var midiEvent = isVariableEvent(eventCode) ? parseVariableEvent(eventCode, eventBytes) : parseSimpleEvent(eventCode, eventBytes);

   return [midiEvent].concat(parseEvents(eventBytes, eventCode));
}

function parseVariableEvent(eventCode, eventBytes) {
   if (eventBytes.length === 0) throw new Error('no event bytes');

   var sizeBytes = parseNextVariableChunk(eventBytes),
       size = parseByteArrayToNumber(sizeBytes, true),
       dataBytes = eventBytes.slice(sizeBytes.length, sizeBytes.length + size);

   return { code: eventCode };
}

function parseSimpleEvent(eventCode, eventBytes) {
   if (eventBytes.length === 0) throw new Error('no event bytes');

   eventBytes.shift();

   return { code: eventCode };
}

module.exports = {
    parse: parse
    // TODO: should we export more functionality?
};
