/* jshint loopfunc: true */
'use strict';

var utils = require('funtils'),
    partial = utils.partial,
    dispatch = utils.dispatch;

var midiUtils = require('./lib/midi-utils.js'),
    toHex = midiUtils.toHex,
    toArr = midiUtils.toArr,
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
    MidiMetaEndOfTrackEvent = types.MidiMetaEndOfTrackEvent,
    MidiChannelEvent = types.MidiChannelEvent;

var constants = require('./lib/midi-constants.js'),
    NOTE_ON_MASK = constants.NOTE_ON_MASK,
    NOTE_OFF_MASK = constants.NOTE_OFF_MASK,
    CONTROL_MASK = constants.CONTROL_MASK;

/* UTILITIES */

/* meta event processing */

var generateMetaEventGuard = partial(function _generateEventGuard(metaEventSubtype, processEvent) {
    var eventMatches = generateMatcher(metaEventSubtype);

    return function _testEvent(eventCode, subtype/*, deltaTime, dataBytes */) {
        if (eventMatches(subtype)) return processEvent.apply(null, arguments);
    };
});

function generateEvent(MetaEventClass, eventCode, subtype, deltaTime, dataBytes, track) {
    return new MetaEventClass({
        code: eventCode,
        subtype: subtype,
        delta: deltaTime,
        dataBytes: dataBytes,
        track: track
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
    function _noMatch(eventCode, subtype/*, deltaTime, dataBytes */) {
        throw new Error('unknown meta event "' + toHex(subtype) + '"');
    }
);

/* note event processing */

var generateNoteEventGuard = partial(function _generateNoteEventGuard(noteEventMask, processEvent) {
    var eventMatches = generateMaskMatcher(noteEventMask);

    return function _testEvent(eventCode/*, subtype, deltaTime, dataBytes */) {
        if (eventMatches(eventCode)) return processEvent.apply(null, arguments);
    };
});

var processNoteEvent = dispatch(
    generateNoteEventGuard(NOTE_ON_MASK, partial(generateNote, MidiNoteOnEvent)),
    generateNoteEventGuard(NOTE_OFF_MASK, partial(generateNote, MidiNoteOffEvent)),
    // TODO: should an exception be thrown?
    function _noMatch(eventCode, subtype/*, deltaTime, dataBytes */) {
        throw new Error('unknown note event "' + toHex(subtype) + '"');
    }
);

function generateNote(NoteClass, eventCode, deltaTime, dataBytes, track) {
    var noteNumber = dataBytes[0],
        noteVelocity = dataBytes[1];

    return new NoteClass({
        code: eventCode,
        delta: deltaTime,
        channel: eventCode & 0xf,
        note: noteNumber,
        velocity: noteVelocity,
        track: track
    });
}

/* channel event processing */

var generateChannelEventGuard = partial(function _generateChannelEventGuard(channelEventMask, processEvent) {
    var eventMatches = generateMaskMatcher(channelEventMask);

    return function _testEvent(eventCode/*, deltaTime, dataBytes */) {
        if (eventMatches(eventCode)) return processEvent.apply(null, arguments);
    };
});

var processChannelEvent = dispatch(
    generateChannelEventGuard(CONTROL_MASK, partial(generateChannelEvent, MidiChannelEvent)),
    function _noMatch(eventCode/*, deltaTime, dataBytes */) {
        throw new Error('unknown channel event "' + toHex(eventCode) + '"');
    }
);

function generateChannelEvent(ChannelClass, eventCode, deltaTime, dataBytes, track) {
    return new ChannelClass({
        code: eventCode,
        delta: deltaTime,
        channel: eventCode & 0xf,
        track: track,
        dataBytes: dataBytes
    });
}

/* parsing */

function parse(midiBytes) {
    var headerOffset = 14,
        // NOTE: I would like to use UInt8Array, but it's a pain to use,
        //       so I convert it to a regular array
        header = parseHeader(toArr(midiBytes, 0, headerOffset)),
        tracks = parseTracks(toArr(midiBytes, headerOffset, midiBytes.length), 1);

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

function parseTracks(midiBytes, track) {
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
        events = parseEvents(eventsBytes, track),
        nameEvents = events.filter(function(event) {
            return event instanceof MidiMetaInstrumentNameEvent;
        }),
        trackName = nameEvents.length <= 0 ? '' : nameEvents[0].instrumentName;

    return [new MidiTrack(events, trackName)].concat(parseTracks(midiBytes.slice(eventsOffset), track + 1));
}

function parseEvents(midiBytes, track) {
    // NOTE: we cannot use recusion here as the stack can get too deep
    //       when parsing long tracks
    var events = [],
        onEventsCache = {};

    while (midiBytes.length) {
        var deltaBytes = parseNextVariableChunk(midiBytes),
            deltaTime = parseByteArrayToNumber(deltaBytes, true),
            eventCode = 0;

        midiBytes = midiBytes.slice(deltaBytes.length);
        eventCode = midiBytes.shift();

        if (!isValidEventCode(eventCode)) throw new Error('Invalid eventCode "' + toHex(eventCode) + '"');

        var dataBytes = [],
            midiEvent = {};

        if (isMetaEvent(eventCode)) {
            var subtype = midiBytes.shift();
            var sizeBytes = parseNextVariableChunk(midiBytes);
            var size = parseByteArrayToNumber(sizeBytes, true);

            dataBytes = midiBytes.slice(sizeBytes.length, sizeBytes.length + size);
            midiEvent = processMetaEvent(eventCode, subtype, deltaTime, dataBytes, track);
            midiBytes = midiBytes.slice(sizeBytes.length + size);
        } else if (isSysexEvent(eventCode)) {
            throw new Error('TODO: sysex event processing...');
        } else if (isNoteEvent(eventCode)) {
            dataBytes = midiBytes.slice(0, 2);
            midiBytes = midiBytes.slice(dataBytes.length);
            midiEvent = processNoteEvent(eventCode, deltaTime, dataBytes, track);

            if (midiEvent instanceof MidiNoteOnEvent) {
                onEventsCache[midiEvent.note] = onEventsCache[midiEvent.note] || [];
                onEventsCache[midiEvent.note].push({
                    index: events.length,
                    event: midiEvent
                });
            } else if (midiEvent instanceof MidiNoteOffEvent) {
                var onEvents = onEventsCache[midiEvent.note];

                if (onEvents && onEvents.length > 0) {
                    var onEvent = onEvents.shift();
                    var origOnEvent = onEvent.event;
                    var endNoteFound = false;
                    var noteLength = events.slice(onEvent.index + 1).reduce(function(sum, event) {
                        if (endNoteFound) return sum;
                        if (event.note === origOnEvent.note && event instanceof MidiNoteOffEvent) endNoteFound = true;
                        return sum + event.delta;
                    }, 0);

                    noteLength += midiEvent.delta;

                    var updatedMidiOnEvent = new MidiNoteOnEvent({
                        code: origOnEvent.code,
                        subtype: origOnEvent.subtype,
                        channel: origOnEvent.channel,
                        note: origOnEvent.note,
                        velocity: origOnEvent.velocity,
                        delta: origOnEvent.delta,
                        track: origOnEvent.track,
                        length: noteLength
                    });

                    events.splice(onEvent.index, 1, updatedMidiOnEvent);

                    if (onEvents.length === 0) delete onEventsCache[midiEvent.note];
                } else {
                    throw new Error('No starting event for note "' + midiEvent.note + '"');
                }
            }
        } else if (isChannelEvent(eventCode)) {
            dataBytes = midiBytes.slice(0, 2);
            midiEvent = processChannelEvent(eventCode, deltaTime, dataBytes, track);
            midiBytes = midiBytes.slice(2);
        } else {
            throw new TypeError('unknown event code "' + toHex(eventCode) + '"');
        }

        events.push(midiEvent);
    }

    return events;
}

module.exports = {
    parse: parse,
    types: types,
    constants: constants
};
