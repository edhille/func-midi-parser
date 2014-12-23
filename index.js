/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
'use strict';

var utils = require('funtils'),
    curry = utils.curry,
    splice = utils.splice,
    partial = utils.partial,
    dispatch = utils.dispatch;

var midiUtils = require('./lib/midi-utils.js'),
    toHex = midiUtils.toHex,
    toArr = midiUtils.toArr,
    parseVariableBytesToNumber = midiUtils.parseVariableBytesToNumber,
    parseStringFromRawChars = midiUtils.parseStringFromRawChars,
    parseByteArrayToNumber = midiUtils.parseByteArrayToNumber,
    parseNextVariableChunk = midiUtils.parseNextVariableChunk,
    generateMatcher = midiUtils.generateMatcher,
    generateMaskMatcher = midiUtils.generateMaskMatcher,
    isValidEventCode = midiUtils.isValidEventCode,
    isMetaEvent = midiUtils.isMetaEvent,
    isSysexEvent = midiUtils.isSysexEvent,
    isNoteEvent = midiUtils.isNoteEvent,
    isChannelEvent = midiUtils.isChannelEvent;

var types = require('./lib/data-types.js'),
    Midi = types.Midi,
    MidiHeader = types.MidiHeader,
    MidiTrack = types.MidiTrack,
    MidiNoteOnEvent = types.MidiNoteOnEvent,
    MidiNoteOffEvent = types.MidiNoteOffEvent,
    MidiMetaTempoEvent = types.MidiMetaTempoEvent,
    MidiMetaTimeSignatureEvent = types.MidiMetaTimeSignatureEvent,
    MidiMetaInstrumentNameEvent = types.MidiMetaInstrumentNameEvent,
    MidiMetaEndOfTrackEvent = types.MidiMetaEndOfTrackEvent;

var constants = require('./lib/midi-constants.js'),
    BYTE_MASK = constants.BYTE_MASK,
    HIGHBIT_MASK = constants.HIGHBIT_MASK,
    META_EVENT = constants.META_EVENT,
    SYSEX_EVENT_MASK = constants.SYSEX_EVENT_MASK,
    NOTE_ON_MASK = constants.NOTE_ON_MASK,
    NOTE_OFF_MASK = constants.NOTE_OFF_MASK,
    TEMPO_META_EVENT = constants.TEMPO_META_EVENT,
    TIME_SIG_META_EVENT = constants.TIME_SIG_META_EVENT,
    INST_NAME_META_EVENT = constants.INST_NAME_META_EVENT,
    END_OF_TRACK_META_EVENT = constants.END_OF_TRACK_META_EVENT;

/* utilities */

var generateMetaEventGuard = partial(function _generateEventGuard(metaEventSubtype, processEvent) {
   var eventMatches = generateMatcher(metaEventSubtype);

   return function _testEvent(eventCode, subtype, deltaTime, dataBytes) {
      if (eventMatches(subtype)) return processEvent.apply(null, arguments);
   };
});

function generateEvent(MetaEventClass, eventCode, subtype, deltaTime, dataBytes) {
   return new MetaEventClass({
      code: eventCode,
      subtype: subtype,
      delta: deltaTime,
      dataBytes: dataBytes
   });
}

var processMetaEvent = dispatch(
   generateMetaEventGuard(0x2F, partial(generateEvent, MidiMetaEndOfTrackEvent)),
   generateMetaEventGuard(0x51, partial(generateEvent, MidiMetaTempoEvent)),
   generateMetaEventGuard(0x58, partial(generateEvent, MidiMetaTimeSignatureEvent)),
   generateMetaEventGuard(0x04, partial(generateEvent, MidiMetaInstrumentNameEvent)),
   // generateEventGuard(0x00, processSequenceNumber),
   // generateEventGuard(0x20, processMidiChannelPrefixAssignment),
   // generateEventGuard(0x01, processTextEvent),
   // generateEventGuard(0x02, processCopyrightNotice),
   // generateEventGuard(0x03, processTrackName),
   // generateEventGuard(0x54, processSmpteOffset),
   // generateEventGuard(0x05, processLyricText),
   // generateEventGuard(0x59, processKeySignature),
   // generateEventGuard(0x06, processMarkerText),
   // generateEventGuard(0x7F, processSequencerSpecificEvent),
   // generateEventGuard(0x07, processCuePoint),
   // TODO: should we throw an exception?
   function _noMatch(eventCode, subtype, deltaTime, dataBytes) { throw new Error('unknown meta event "' + toHex(subtype) + '"'); }
);

var generateNoteEventGuard = partial(function _generateNoteEventGuard(noteEventMask, processEvent) {
   var eventMatches = generateMaskMatcher(noteEventMask);

   return function _testEvent(eventCode, subtype, deltaTime, dataBytes) {
      if (eventMatches(eventCode)) return processEvent.apply(null, arguments);
   };
});

var processNoteEvent = dispatch(
   generateNoteEventGuard(NOTE_ON_MASK, partial(generateNote, MidiNoteOnEvent)),
   generateNoteEventGuard(NOTE_OFF_MASK, partial(generateNote, MidiNoteOffEvent)),
   // TODO: should an exception be thrown?
   function _noMatch(eventCode, subtype, deltaTime, dataBytes) { throw new Error('unknown note event "' + toHex(subtype) + '"'); }
);

function generateNote(NoteClass, eventCode, deltaTime, dataBytes) {
   var noteNumber = dataBytes[0],
       noteVelocity = dataBytes[1];

   return new NoteClass({
      code: eventCode,
      delta: deltaTime,
      channel: eventCode & 0xf,
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

    if (format < 0 || format > 2) throw new Error('malformed midi: unknown format (' + format + ')');

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
       events = parseEvents(eventsBytes),
       nameEvents = events.filter(function (event) { return event instanceof MidiMetaInstrumentNameEvent; }),
       trackName = nameEvents.length <= 0 ? '' : nameEvents[0].instrumentName;

   return [new MidiTrack(events, trackName)].concat(parseTracks(midiBytes.slice(eventsOffset)));
}

function parseEvents(midiBytes, lastEventType) {
   if (midiBytes.length === 0) return [];

   var deltaBytes = parseNextVariableChunk(midiBytes),
       deltaTime = parseByteArrayToNumber(deltaBytes, true),
       eventBytes = midiBytes.slice(deltaBytes.length),
       eventCode = eventBytes.shift();

   if (!isValidEventCode(eventCode)) {
      // TODO: test this edge case (need malformed midi file)
      if (!lastEventType) throw new TypeError('no previous event type to use');

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
      eventBytes = eventBytes.slice(sizeBytes.length + size);
      midiEvent = processMetaEvent(eventCode, subtype, deltaTime, dataBytes);
   } else if (isSysexEvent(eventCode)) {
      throw new Error('TODO: sysex event processing...');
   } else if (isNoteEvent(eventCode)) {
      dataBytes = eventBytes.slice(0, 2);
      eventBytes = eventBytes.slice(dataBytes.length);

      midiEvent = processNoteEvent(eventCode, deltaTime, dataBytes);

      // TODO: this does not seem ideal, but we need to track note length
      if (midiEvent instanceof MidiNoteOnEvent) {
         var laterEvents = parseEvents(eventBytes, eventCode);
         var endNoteFound = false;
         var noteLength = laterEvents.reduce(function (sum, event) {
            if (endNoteFound) return sum;
            if (event.note === midiEvent.note && event instanceof MidiNoteOffEvent) endNoteFound = true;
            return sum + event.delta;
         }, 0);

         midiEvent = new MidiNoteOnEvent({
            code: midiEvent.code,
            subtype: midiEvent.subtype,
            note: midiEvent.note,
            velocity: midiEvent.velocity,
            delta: midiEvent.delta,
            length: noteLength
         });

         return [midiEvent].concat(laterEvents);
      }

   } else if (isChannelEvent(eventCode)) {
      // TODO: gobble up channel events...
      eventBytes = eventBytes.slice(4);
   } else {
          throw new TypeError('unknown event code "' + toHex(eventCode) + '"');
   }

   return [midiEvent].concat(parseEvents(eventBytes, eventCode));
}

module.exports = { parse: parse,
    types: types,
    constants: constants
};
