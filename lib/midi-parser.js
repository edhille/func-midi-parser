/* jshint loopfunc: true */
'use strict';

var utils = require('funtils'),
    partial = utils.partial,
    dispatch = utils.dispatch;

var midiUtils = require('./midi-utils'),
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
    isPolyphonicAftertouchEvent = midiUtils.isPolyphonicAftertouchEvent,
	isControlChangeEvent = midiUtils.isControlChangeEvent,
	isProgramChangeEvent = midiUtils.isProgramChangeEvent,
	isChannelAftertouchEvent = midiUtils.isChannelAftertouchEvent,
	isPitchWheelEvent = midiUtils.isPitchWheelEvent;

var types = require('./data-types'),
    Midi = types.Midi,
    MidiHeader = types.MidiHeader,
    MidiTrack = types.MidiTrack,
    MidiMetaSequenceEvent = types.MidiMetaSequenceEvent ,
    MidiMetaTextEvent = types.MidiMetaTextEvent ,
    MidiMetaCopyrightEvent = types.MidiMetaCopyrightEvent ,
	MidiMetaTrackNameEvent = types.MidiMetaTrackNameEvent,
    MidiMetaInstrumentNameEvent = types.MidiMetaInstrumentNameEvent,
    MidiMetaLyricTextEvent = types.MidiMetaLyricTextEvent ,
    MidiMetaMarkerTextEvent = types.MidiMetaMarkerTextEvent ,
    MidiMetaCuePointEvent = types.MidiMetaCuePointEvent ,
    MidiMetaChannelPrefixEvent = types.MidiMetaChannelPrefixEvent ,
    MidiMetaEndOfTrackEvent = types.MidiMetaEndOfTrackEvent,
    MidiMetaTempoEvent = types.MidiMetaTempoEvent,
	MidiMetaSmpteOffsetEvent = types.MidiMetaSmpteOffsetEvent,
    MidiMetaTimeSignatureEvent = types.MidiMetaTimeSignatureEvent,
	MidiMetaKeySignatureEvent = types.MidiMetaKeySignatureEvent,
    MidiMetaSequencerSpecificEvent = types.MidiMetaSequencerSpecificEvent ,
    MidiNoteOnEvent = types.MidiNoteOnEvent,
    MidiNoteOffEvent = types.MidiNoteOffEvent,
	MidiPolyphonicAftertouchEvent = types.MidiPolyphonicAftertouchEvent,
	MidiControlChangeEvent = types.MidiControlChangeEvent ,
	MidiProgramChangeEvent = types.MidiProgramChangeEvent ,
	MidiChannelAftertouchEvent = types.MidiChannelAftertouchEvent ,
	MidiPitchWheelEvent = types.MidiPitchWheelEvent ,
    MidiChannelEvent = types.MidiChannelEvent;

var constants = require('./midi-constants'),
    NOTE_ON_MASK = constants.NOTE_ON_MASK,
    NOTE_OFF_MASK = constants.NOTE_OFF_MASK,
    CONTROL_MASK = constants.CONTROL_MASK,
    SEQUENCE_META_EVENT = constants.SEQUENCE_META_EVENT ,
    TEXT_META_EVENT = constants.TEXT_META_EVENT ,
    COPYRIGHT_META_EVENT = constants.COPYRIGHT_META_EVENT ,
    TRACK_NAME_META_EVENT = constants.TRACK_NAME_META_EVENT ,
    INST_NAME_META_EVENT = constants.INST_NAME_META_EVENT ,
    LYRIC_TEXT_META_EVENT = constants.LYRIC_TEXT_META_EVENT ,
    MARKER_TEXT_META_EVENT = constants.MARKER_TEXT_META_EVENT ,
    CUE_POINT_META_EVENT = constants.CUE_POINT_META_EVENT ,
    CHANNEL_PREFIX_ASSIGNMENT_META_EVENT = constants.CHANNEL_PREFIX_ASSIGNMENT_META_EVENT ,
    END_OF_TRACK_META_EVENT = constants.END_OF_TRACK_META_EVENT ,
    TEMPO_META_EVENT = constants.TEMPO_META_EVENT ,
    SMPTE_OFFSET_META_EVENT = constants.SMPTE_OFFSET_META_EVENT ,
    TIME_SIG_META_EVENT = constants.TIME_SIG_META_EVENT ,
    KEY_SIGNATURE_META_EVENT = constants.KEY_SIGNATURE_META_EVENT ,
    SEQUENCER_SPECIFIC_META_EVENT = constants.SEQUENCER_SPECIFIC_META_EVENT ;

/* UTILITIES */

/* meta event processing */

var generateMetaEventGuard = partial(function _generateEventGuard(metaEventSubtype, processEvent) {
    var eventMatches = generateMatcher(metaEventSubtype);

    return function _testEvent(eventCode, subtype/*, deltaTime, dataBytes */) {
        if (eventMatches(subtype)) return processEvent.apply(null, arguments);
    };
});

function generateMetaEvent(paramsMapper, MetaEventClass, eventCode, subtype, deltaTime, dataBytes, track) {
	var params = {
		code: eventCode,
		subtype: subtype,
		delta: deltaTime,
		track: track
	};

    return new MetaEventClass(paramsMapper(params, dataBytes));
}

function mapSequenceParams(/* params, dataBytes */) {
	throw new Error('TODO: map sequence params');
	// return params;
}

function mapTextMetaParams(params, dataBytes) {
	params.name = parseStringFromRawChars(dataBytes);

	return params;
}

function mapCopyrightParams(params, dataBytes) {
	params.copyright = parseStringFromRawChars(dataBytes);

	return params;
}

function mapTrackNameParams(params, dataBytes) {
	params.name = parseStringFromRawChars(dataBytes);

	return params;
}

function mapInstNameParams(params, dataBytes) {
	params.name = parseStringFromRawChars(dataBytes);

	return params;
}

function mapLyricParams(params, dataBytes) {
	params.lyrics = parseStringFromRawChars(dataBytes);

	return params;
}

function mapMarkerParams(/* params, dataBytes */) {
	throw new Error('TODO: map sequence params');
	// return params;
}

function mapCueParams(/* params, dataBytes */) {
	throw new Error('TODO: map sequence params');
	// return params;
}

function mapChannelPrefixParams(/* params, dataBytes */) {
	throw new Error('TODO: map sequence params');
	// return params;
}

function mapEndOfTrackParams(params/* , dataBytes */) {
	return params;
}

function mapTempoParams(params, dataBytes) {
	params.microsecPerQn = parseByteArrayToNumber(dataBytes);

	return params;
}

function mapSmpteOffsetParams(params, dataBytes) {
	params.frameRate = dataBytes[0];
	params.min = dataBytes[1];
	params.sec = dataBytes[2];
	params.frames = dataBytes[3];
	params.subframes = dataBytes[4];

	return params;
}

function mapTimeSigParams(params, dataBytes) {
	params.numerator = dataBytes[0];
	params.denominator = Math.pow(2, dataBytes[1]);
	params.metronomeClicksPerTick = dataBytes[2];
	params.thirtySecondNotesPerBeat = dataBytes[3];

	return params;
}

function mapKeySigparams(params, dataBytes) {
	params.key = dataBytes[0];
	params.sf = dataBytes[1];
	params.mi = dataBytes[2];

	return params;
}

function mapSequencerParams(/* params, dataBytes */) {
	throw new Error('TODO: map sequencer params');
	// return params;
}

var processMetaEvent = dispatch(
    generateMetaEventGuard(SEQUENCE_META_EVENT, partial(generateMetaEvent, mapSequenceParams, MidiMetaSequenceEvent)),
    generateMetaEventGuard(TEXT_META_EVENT, partial(generateMetaEvent, mapTextMetaParams, MidiMetaTextEvent)),
    generateMetaEventGuard(COPYRIGHT_META_EVENT, partial(generateMetaEvent, mapCopyrightParams, MidiMetaCopyrightEvent)),
    generateMetaEventGuard(TRACK_NAME_META_EVENT, partial(generateMetaEvent, mapTrackNameParams, MidiMetaTrackNameEvent)),
    generateMetaEventGuard(INST_NAME_META_EVENT, partial(generateMetaEvent, mapInstNameParams, MidiMetaInstrumentNameEvent)),
    generateMetaEventGuard(LYRIC_TEXT_META_EVENT, partial(generateMetaEvent, mapLyricParams, MidiMetaLyricTextEvent)),
    generateMetaEventGuard(MARKER_TEXT_META_EVENT, partial(generateMetaEvent, mapMarkerParams, MidiMetaMarkerTextEvent)),
    generateMetaEventGuard(CUE_POINT_META_EVENT, partial(generateMetaEvent, mapCueParams, MidiMetaCuePointEvent)),
    generateMetaEventGuard(CHANNEL_PREFIX_ASSIGNMENT_META_EVENT, partial(generateMetaEvent, mapChannelPrefixParams, MidiMetaChannelPrefixEvent)),
    generateMetaEventGuard(END_OF_TRACK_META_EVENT, partial(generateMetaEvent, mapEndOfTrackParams, MidiMetaEndOfTrackEvent)),
    generateMetaEventGuard(TEMPO_META_EVENT, partial(generateMetaEvent, mapTempoParams, MidiMetaTempoEvent)),
    generateMetaEventGuard(SMPTE_OFFSET_META_EVENT, partial(generateMetaEvent, mapSmpteOffsetParams, MidiMetaSmpteOffsetEvent)),
    generateMetaEventGuard(TIME_SIG_META_EVENT, partial(generateMetaEvent, mapTimeSigParams, MidiMetaTimeSignatureEvent)),
    generateMetaEventGuard(KEY_SIGNATURE_META_EVENT, partial(generateMetaEvent, mapKeySigparams, MidiMetaKeySignatureEvent)),
    generateMetaEventGuard(SEQUENCER_SPECIFIC_META_EVENT, partial(generateMetaEvent, mapSequencerParams, MidiMetaSequencerSpecificEvent)),
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
    var noteNumber = dataBytes[0];
	var noteVelocity = dataBytes[1];

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

function processPolyphonicAtertouchEvent(eventCode, deltaTime, dataBytes, track) {
	return new MidiPolyphonicAftertouchEvent({
		code: eventCode,
		delta: deltaTime,
		track: track,
		note: dataBytes[0],
		pressure: dataBytes[1]
	});
}

function processControlChangeEvent(eventCode, deltaTime, dataBytes, track) {
	return new MidiControlChangeEvent({
		code: eventCode,
		delta: deltaTime,
		track: track
	});
}

function processProgramChangeEvent(eventCode, deltaTime, dataBytes, track) {
	return new MidiProgramChangeEvent({
		code: eventCode,
		delta: deltaTime,
		track: track

	});
}

function processChannelAftertouchEvent(eventCode, deltaTime, dataBytes, track) {
	return new MidiChannelAftertouchEvent({
		code: eventCode,
		delta: deltaTime,
		track: track
	});
}

function processPitchWheelEvent(eventCode, deltaTime, dataBytes, track) {
	return new MidiPitchWheelEvent({
		code: eventCode,
		delta: deltaTime,
		track: track
	});
}

function generateChannelEvent(ChannelClass, eventCode, deltaTime, dataBytes, track) {
    return new ChannelClass({
        code: eventCode,
        delta: deltaTime,
        channel: eventCode & 0xf,
        track: track,
		// TODO: get away from using dataBytes
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
    var events = [];
	var onEventsCache = {};
	var lastEventCode = 0;

    while (midiBytes.length) {
        var deltaBytes = parseNextVariableChunk(midiBytes);
        var deltaTime = parseByteArrayToNumber(deltaBytes, true);
        var eventCode = 0;

        midiBytes = midiBytes.slice(deltaBytes.length);

		if (!isValidEventCode(midiBytes[0])) {
			// NOTE: we assume we have a running status if the event code is invalid
			//       in that case, reuse the last event and process the rest of the
			//       information as if it were for that type of event
			eventCode = lastEventCode;
		} else {
			eventCode = midiBytes.shift();
		}

        var dataBytes = [];
		var midiEvent = {};

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

			if (midiEvent instanceof MidiNoteOnEvent && midiEvent.velocity === 0 && onEventsCache[midiEvent.note]) {
				// NOTE: some programs (at least Logic Pro X) appear to sometimes use note-on events with a 
				//       zero velocity rather than a true note-off event...
				midiEvent = new MidiNoteOffEvent({
					code: eventCode - 0x10, // convert the code to be a "note off" code (ie 0x80-0x8f)
					delta: midiEvent.delta,
					channel: midiEvent.channel,
					note: midiEvent.note,
					velocity: midiEvent.velocity,
					track: midiEvent.track
				});
			}

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
		} else if (isPolyphonicAftertouchEvent(eventCode)) {
            midiEvent = processPolyphonicAtertouchEvent(eventCode, deltaTime, dataBytes, track);
            midiBytes = midiBytes.slice(2);
		} else if (isControlChangeEvent(eventCode)) {
            midiEvent = processControlChangeEvent(eventCode, deltaTime, dataBytes, track);
            midiBytes = midiBytes.slice(2);
		} else if (isProgramChangeEvent(eventCode)) {
            midiEvent = processProgramChangeEvent(eventCode, deltaTime, dataBytes, track);
            midiBytes = midiBytes.slice(1);
		} else if (isChannelAftertouchEvent(eventCode)) {
            midiEvent = processChannelAftertouchEvent(eventCode, deltaTime, dataBytes, track);
            midiBytes = midiBytes.slice(1);
		} else if (isPitchWheelEvent(eventCode)) {
			midiEvent = processPitchWheelEvent(eventCode, deltaTime, dataBytes, track);
			midiBytes = midiBytes.slice(2);
		} else {
            throw new TypeError('unknown event code "' + toHex(eventCode) + '"');
        }

		lastEventCode = eventCode;

        events.push(midiEvent);
    }

    return events;
}

module.exports = {
    parse: parse,
    types: types,
    constants: constants
};
