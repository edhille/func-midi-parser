/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
'use strict';

var utils = require('./lib/utils.js'),
    curry = utils.curry,
    splice = utils.splice,
    partial = utils.partial,
    dispatch = utils.dispatch;

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

   MidiEvent.call(this, params);
}

MidiMetaEvent.prototype = Object.create(MidiEvent);

function MidiMetaTempoEvent(params) {
   console.log('PARAMS: ', params);
   this.tempo = parseByteArrayToNumber(params.dataBytes);

   params.subtype = 'tempo';

   MidiMetaEvent.call(this, params);
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

   MidiMetaEvent.call(this, params);
}

MidiMetaTimeSignatureEvent.prototype = Object.create(MidiMetaEvent);

function MidiMetaInstrumentNameEvent(params) {
   this.instrumentName = params.data.bytes.map(function (charCode) { return String.fromCharCode(charCode); }).join('');

   params.subtype = 'instrument_name';

   MidiMetaEvent.call(this, params);
}

MidiMetaInstrumentNameEvent.prototype = Object.create(MidiMetaEvent);

function MidiMetaEndOfTrackEvent(params) {
   params.subtype = 'end';

   MidiMetaEvent.call(this, params);
}

MidiMetaEndOfTrackEvent.prototype = Object.create(MidiMetaEvent);

function MidiSystemEvent(params) {
   params.type = 'system';

   MidiEvent.call(this, params);
}

MidiSystemEvent.prototype = Object.create(MidiEvent);

function MidiNoteEvent(params) {
   params.type = 'note';

   this.note = params.note;
   this.velocity = params.velocity;
   
   MidiEvent.call(this, params);
}

MidiNoteEvent.prototype = Object.create(MidiEvent);

function MidiNoteOnEvent(params) {
   params.type = 'note';
   params.subtype = 'on';

   MidiNoteEvent.call(this, params);
}

MidiNoteOnEvent.prototype = Object.create(MidiNoteEvent);

function MidiNoteOffEvent(params) {
   params.type = 'note';
   params.subtype = 'off';

   MidiNoteEvent.call(this, params);
}

MidiNoteOffEvent.prototype = Object.create(MidiNoteEvent);

/* utilities */

function toHex(item) {
   if (item instanceof Array) {
      return item.map(function (b) { return b.toString(16); });
   } else {
      return item.toString(16);
   }
   
}

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

function matchesByteMask(byteMask, testByte) {
   return (testByte & byteMask) === byteMask;
}

function isVariableEvent(code) {
   return isMetaEvent(code) || isSysexEvent(code);
}

function isMetaEvent(code) {
   return matchesByteMask(META_EVENT, code);
}

function isSysexEvent(code) {
   return matchesByteMask(SYSEX_EVENT_MASK, code);
}

function isNoteEvent(code) {
   return matchesByteMask(NOTE_ON_MASK, code) || matchesByteMask(NOTE_OFF_MASK, code);
}

function isValidEventCode(code) {
   if (isMetaEvent(code)) return true;
   if (isNoteEvent(code)) return true;
   if (isSysexEvent(code)) return true;

   if (code) {
      console.log('Invalid code', '0x' + code.toString(16));
   }

   return false;
}

var generateMatchMask = curry(function _matchMask(bitMask) {
   return function _matchTestByte(testByte) {
      return (testByte & bitMask) === bitMask;
   };
});

var generateEventGuard = partial(function _generateEventGuard(metaEventSubtype, metaEventProcessor) {
   var matchMask = generateMatchMask(metaEventSubtype);

   return function _testEvent(eventCode, subtype, deltaTime, dataBytes) {
      if (!matchMask(eventCode)) return;

      return metaEventProcessor.call(null, eventCode, subtype, deltaTime, dataBytes);
   };
});

var processMetaEvent = dispatch(
   // generateEventGuard(0x00, processSequenceNumber),
   // generateEventGuard(0x20, processMidiChannelPrefixAssignment),
   // generateEventGuard(0x01, processTextEvent),
   // generateEventGuard(0x2F, processEndOfTrack),
   // generateEventGuard(0x02, processCopyrightNotice),
   generateEventGuard(0x51, processTempo),
   // generateEventGuard(0x03, processTrackName),
   // generateEventGuard(0x54, processSmpteOffset),
   // generateEventGuard(0x04, processInstrumentName),
   // generateEventGuard(0x58, processTimeSignature),
   // generateEventGuard(0x05, processLyricText),
   // generateEventGuard(0x59, processKeySignature),
   // generateEventGuard(0x06, processMarkerText),
   // generateEventGuard(0x7F, processSequencerSpecificEvent),
   // generateEventGuard(0x07, processCuePoint),
   function _noMatch(eventCode, subtype, deltaTime, dataBytes) { throw new Error('unknown meta event "' + subtype + '"'); }
);

function processTempo(eventCode, subtype, deltaTime, dataBytes) {
   return new MidiMetaTempoEvent({
      code: eventCode,
      subtype: subtype,
      delta: deltaTime,
      dataBytes: dataBytes
   });
}

var processNoteEvent = dispatch(
   generateEventGuard(NOTE_ON_MASK, processNoteOn),
   generateEventGuard(NOTE_OFF_MASK, processNoteOff),
   function _noMatch(eventCode, subtype, deltaTime, dataBytes) { throw new Error('unknown note event "' + subtype + '"'); }
);

function processNoteOn(eventCode, subtype, deltaTime, dataBytes) {
   var noteNumber = dataBytes[0],
       noteVelocity = dataBytes[1];

   return new MidiNoteOnEvent({
      code: eventCode,
      subtype: subtype,
      delta: deltaTime,
      note: noteNumber,
      velocity: noteVelocity
   });
}

function processNoteOff(eventCode, subtype, deltaTime, dataBytes) {
   var noteNumber = dataBytes[0],
       noteVelocity = dataBytes[1];

   return new MidiNoteOffEvent({
      code: eventCode,
      subtype: subtype,
      delta: deltaTime,
      note: noteNumber,
      velocity: noteVelocity
   });
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

function parseEvents(midiBytes, lastEventType) {
   if (midiBytes.length === 0) return [];

   console.log('parseEvents', midiBytes.length, lastEventType);

   var deltaBytes = parseNextVariableChunk(midiBytes),
       deltaTime = parseByteArrayToNumber(deltaBytes, true),
       foo = console.log('deltaBytes:', toHex(deltaBytes), 'deltaTime:', toHex(deltaTime)),
       eventBytes = midiBytes.slice(deltaBytes.length),
       eventCode = eventBytes.shift();

   console.log('eventCode:', toHex(eventCode), 'eventBytes:', toHex(eventBytes));

   if (!isValidEventCode(eventCode)) {
      // TODO: test this edge case (need malformed midi file)
      if (!lastEventType) throw new Error('no previous event type to use');

      eventBytes.unshift(eventCode);
      eventCode = lastEventType;
   }

   var midiEvent = {},
       subtype = null,
       sizeBytes = [],
       size = 0,
       dataBytes = [];

   if (isMetaEvent(eventCode)) {
      subtype = eventBytes.shift();
      sizeBytes = parseNextVariableChunk(eventBytes);
      size = parseByteArrayToNumber(sizeBytes, true);
      dataBytes = eventBytes.slice(sizeBytes.length, sizeBytes.length + size);

      midiEvent = processMetaEvent(eventCode, subtype, deltaTime, dataBytes);

      // TODO: this is not exactly how I'd like to do this...
      eventBytes = eventBytes.slice(sizeBytes.length + size);
   } else if (isSysexEvent(eventCode)) {
      throw new Error('TODO: sysex event processing...');
   } else if (isNoteEvent(eventCode)) {
      subtype = eventBytes.shift();
      dataBytes = eventBytes.slice(0, 2);

      midiEvent = processNoteEvent(eventCode, subtype, deltaTime, dataBytes);

      // TODO: again, not exactly how I'd like to adjust the eventBytes array
      eventBytes = eventBytes.slice(2);
   } else {
      throw new Error('unknown event code "' + toHex(eventCode) + '"');
   }

   return [midiEvent].concat(parseEvents(eventBytes, eventCode));
}

module.exports = {
    parse: parse
    // TODO: should we export more functionality?
};
