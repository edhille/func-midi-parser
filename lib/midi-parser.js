/* jshint loopfunc: true */
'use strict';

/**
 * @module midiParser
 */

const utils = require('funtils');
const partial = utils.partial;
const dispatch = utils.dispatch;

const midiUtils = require('./midi-utils');
const toHex = midiUtils.toHex;
const toArr = midiUtils.toArr;
const parseStringFromRawChars = midiUtils.parseStringFromRawChars;
const parseByteArrayToNumber = midiUtils.parseByteArrayToNumber;
const parseNextVariableChunk= midiUtils.parseNextVariableChunk;
const generateMatcher = midiUtils.generateMatcher;
const generateMaskMatcher = midiUtils.generateMaskMatcher;
const isValidEventCode = midiUtils.isValidEventCode;
const isMetaEvent = midiUtils.isMetaEvent;
const isSysexEvent = midiUtils.isSysexEvent;
const isNoteEvent = midiUtils.isNoteEvent;
const isPolyphonicAftertouchEvent = midiUtils.isPolyphonicAftertouchEvent;
const isControlChangeEvent = midiUtils.isControlChangeEvent;
const isProgramChangeEvent = midiUtils.isProgramChangeEvent;
const isChannelAftertouchEvent = midiUtils.isChannelAftertouchEvent;
const isPitchWheelEvent = midiUtils.isPitchWheelEvent;

const types = require('./data-types');
const Midi = types.Midi;
const MidiHeader = types.MidiHeader;
const MidiTrack = types.MidiTrack;
const MidiMetaSequenceEvent = types.MidiMetaSequenceEvent;
const MidiMetaTextEvent = types.MidiMetaTextEvent;
const MidiMetaCopyrightEvent = types.MidiMetaCopyrightEvent;
const MidiMetaTrackNameEvent = types.MidiMetaTrackNameEvent;
const MidiMetaInstrumentNameEvent = types.MidiMetaInstrumentNameEvent;
const MidiMetaLyricTextEvent = types.MidiMetaLyricTextEvent;
const MidiMetaMarkerEvent = types.MidiMetaMarkerEvent;
const MidiMetaCuePointEvent = types.MidiMetaCuePointEvent;
const MidiMetaChannelPrefixEvent = types.MidiMetaChannelPrefixEvent;
const MidiMetaEndOfTrackEvent = types.MidiMetaEndOfTrackEvent;
const MidiMetaTempoEvent = types.MidiMetaTempoEvent;
const MidiMetaSmpteOffsetEvent = types.MidiMetaSmpteOffsetEvent;
const MidiMetaTimeSignatureEvent = types.MidiMetaTimeSignatureEvent;
const MidiMetaKeySignatureEvent = types.MidiMetaKeySignatureEvent;
const MidiMetaSequencerSpecificEvent = types.MidiMetaSequencerSpecificEvent;
const MidiNoteOnEvent = types.MidiNoteOnEvent;
const MidiNoteOffEvent = types.MidiNoteOffEvent;
const MidiPolyphonicAftertouchEvent = types.MidiPolyphonicAftertouchEvent;
const MidiControlChangeEvent = types.MidiControlChangeEvent;
const MidiProgramChangeEvent = types.MidiProgramChangeEvent;
const MidiChannelAftertouchEvent = types.MidiChannelAftertouchEvent;
const MidiPitchWheelEvent = types.MidiPitchWheelEvent;

const constants = require('./midi-constants');
const NOTE_ON_MASK = constants.NOTE_ON_MASK;
const NOTE_OFF_MASK = constants.NOTE_OFF_MASK;
const SEQUENCE_META_EVENT = constants.SEQUENCE_META_EVENT;
const TEXT_META_EVENT = constants.TEXT_META_EVENT;
const COPYRIGHT_META_EVENT = constants.COPYRIGHT_META_EVENT;
const TRACK_NAME_META_EVENT = constants.TRACK_NAME_META_EVENT;
const INST_NAME_META_EVENT = constants.INST_NAME_META_EVENT;
const LYRIC_TEXT_META_EVENT = constants.LYRIC_TEXT_META_EVENT;
const MARKER_TEXT_META_EVENT = constants.MARKER_TEXT_META_EVENT;
const CUE_POINT_META_EVENT = constants.CUE_POINT_META_EVENT;
const CHANNEL_PREFIX_ASSIGNMENT_META_EVENT = constants.CHANNEL_PREFIX_ASSIGNMENT_META_EVENT;
const END_OF_TRACK_META_EVENT = constants.END_OF_TRACK_META_EVENT;
const TEMPO_META_EVENT = constants.TEMPO_META_EVENT;
const SMPTE_OFFSET_META_EVENT = constants.SMPTE_OFFSET_META_EVENT;
const TIME_SIG_META_EVENT = constants.TIME_SIG_META_EVENT;
const KEY_SIGNATURE_META_EVENT = constants.KEY_SIGNATURE_META_EVENT;
const SEQUENCER_SPECIFIC_META_EVENT = constants.SEQUENCER_SPECIFIC_META_EVENT;

/* UTILITIES */

/* meta event processing */

const generateMetaEventGuard = partial(function _generateEventGuard(metaEventSubtype, processEvent) {
	const eventMatches = generateMatcher(metaEventSubtype);

	return function _testEvent(eventCode, subtype/*, deltaTime, dataBytes */) {
		if (eventMatches(subtype)) return processEvent.apply(null, arguments);
	};
});

function generateMetaEvent(paramsMapper, MetaEventClass, eventCode, subtype, deltaTime, dataBytes, track) {
	const params = {
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

function mapMarkerParams(params, dataBytes) {
	params.name = parseStringFromRawChars(dataBytes);

	return params;
}

function mapCueParams(/* params, dataBytes */) {
	throw new Error('TODO: map cue params');
	// return params;
}

function mapChannelPrefixParams(params, dataBytes) {
	params.channel = dataBytes; // The last byte is the MIDI channel and has values from 0x00 to 0x0F (0 to 15 decimal).
	return params;
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
	params.sf = dataBytes[1];
	params.mi = dataBytes[2];

	return params;
}

function mapSequencerParams(/* params, dataBytes */) {
	throw new Error('TODO: map sequencer params');
	// return params;
}

const processMetaEvent = dispatch(
    generateMetaEventGuard(SEQUENCE_META_EVENT, partial(generateMetaEvent, mapSequenceParams, MidiMetaSequenceEvent)),
    generateMetaEventGuard(TEXT_META_EVENT, partial(generateMetaEvent, mapTextMetaParams, MidiMetaTextEvent)),
    generateMetaEventGuard(COPYRIGHT_META_EVENT, partial(generateMetaEvent, mapCopyrightParams, MidiMetaCopyrightEvent)),
    generateMetaEventGuard(TRACK_NAME_META_EVENT, partial(generateMetaEvent, mapTrackNameParams, MidiMetaTrackNameEvent)),
    generateMetaEventGuard(INST_NAME_META_EVENT, partial(generateMetaEvent, mapInstNameParams, MidiMetaInstrumentNameEvent)),
    generateMetaEventGuard(LYRIC_TEXT_META_EVENT, partial(generateMetaEvent, mapLyricParams, MidiMetaLyricTextEvent)),
    generateMetaEventGuard(MARKER_TEXT_META_EVENT, partial(generateMetaEvent, mapMarkerParams, MidiMetaMarkerEvent)),
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

const generateNoteEventGuard = partial(function _generateNoteEventGuard(noteEventMask, processEvent) {
	const eventMatches = generateMaskMatcher(noteEventMask);

	return function _testEvent(eventCode/*, subtype, deltaTime, dataBytes */) {
		if (eventMatches(eventCode)) return processEvent.apply(null, arguments);
	};
});

const processNoteEvent = dispatch(
    generateNoteEventGuard(NOTE_ON_MASK, partial(generateNote, MidiNoteOnEvent)),
    generateNoteEventGuard(NOTE_OFF_MASK, partial(generateNote, MidiNoteOffEvent)),
    // TODO: should an exception be thrown?
	function _noMatch(eventCode, subtype/*, deltaTime, dataBytes */) {
		throw new Error('unknown note event "' + toHex(subtype) + '"');
	}
);

function generateNote(NoteClass, eventCode, deltaTime, dataBytes, track) {
	const noteNumber = dataBytes[0];
	const noteVelocity = dataBytes[1];

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

/* parsing */

/**
 * @name parse
 * @function
 * @description parses given array of unsigned 8-bit integers into Midi data type
 * @param {array} midiBytes - array of unsinged 8-bit integers representing raw midi data
 * @return {Midi}
 */
function parse(midiBytes) {
	const headerOffset = 14;
	// NOTE: I would like to use UInt8Array, but it's a pain to use,
	//       so I convert it to a regular array
	const header = parseHeader(toArr(midiBytes, 0, headerOffset));
	const tracks = parseTracks(toArr(midiBytes, headerOffset, midiBytes.length), 1);

	// TODO: test this error case (need a malformed midi file)
	if (tracks.length !== header.trackCount) throw new Error('Parsed wrong number of tracks: expected (' + header.trackCount + '), but got (' + tracks.length + ')');

	return new Midi({ header: header, tracks: tracks });
}

function parseHeader(midiBytes) {
	const chunkId = parseStringFromRawChars(midiBytes.slice(0, 4));

	if (chunkId !== 'MThd') throw new Error('malformed midi: could not find "MThd"');

	const size = parseByteArrayToNumber(midiBytes.slice(4, 8));

	if (size !== 6) throw new Error('malformed midi: unexpected header size (' + size + ')');

	const format = parseByteArrayToNumber(midiBytes.slice(8, 10));

	if (format < 0 || format > 2) throw new Error('malformed midi: unknown format (' + format + ')');

	const trackCount = parseByteArrayToNumber(midiBytes.slice(10, 12));
	const timeDivision = parseByteArrayToNumber(midiBytes.slice(12, 14));

	return new MidiHeader({
		format: format,
		trackCount: trackCount,
		timeDivision: timeDivision
	});
}

function parseTracks(midiBytes, track) {
	if (midiBytes.length === 0) return [];

	const chunkIdOffset = 4;
	const chunkIdBytes = midiBytes.slice(0, chunkIdOffset);
	const chunkId = parseStringFromRawChars(chunkIdBytes);

	// TODO: test this (need invalid midi file)
	if (chunkId !== 'MTrk') throw new Error('Invalid header chunkId "' + chunkId + '"');

	const trackSizeOffset = chunkIdOffset + 4;
	const trackSizeBytes = midiBytes.slice(chunkIdOffset, trackSizeOffset);
	const trackSize = parseByteArrayToNumber(trackSizeBytes);
	const eventsOffset = trackSizeOffset + trackSize;
	const eventsBytes = midiBytes.slice(trackSizeOffset, eventsOffset);
	const events = parseEvents(eventsBytes, track);
	const nameEvents = events.filter(function(event) {
		return event instanceof MidiMetaInstrumentNameEvent;
	});
	const trackName = nameEvents.length <= 0 ? '' : nameEvents[0].instrumentName;

	return [new MidiTrack({ events: events, name: trackName })].concat(parseTracks(midiBytes.slice(eventsOffset), track + 1));
}

function parseEvents(midiBytes, track) {
	// NOTE: we cannot use recusion here as the stack can get too deep
	//       when parsing long tracks
	const events = [];
	const onEventsCache = {};
	let lastEventCode = 0;

	while (midiBytes.length) {
		const deltaBytes = parseNextVariableChunk(midiBytes);
		const deltaTime = parseByteArrayToNumber(deltaBytes, true);
		let eventCode = 0;

		midiBytes = midiBytes.slice(deltaBytes.length);

		if (!isValidEventCode(midiBytes[0])) {
			// NOTE: we assume we have a running status if the event code is invalid
			//       in that case, reuse the last event and process the rest of the
			//       information as if it were for that type of event
			eventCode = lastEventCode;
		} else {
			eventCode = midiBytes.shift();
		}

		let dataBytes = [];
		let midiEvent = {};

		if (isMetaEvent(eventCode)) {
			const subtype = midiBytes.shift();
			const sizeBytes = parseNextVariableChunk(midiBytes);
			const size = parseByteArrayToNumber(sizeBytes, true);

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
				const onEvents = onEventsCache[midiEvent.note];

				if (onEvents && onEvents.length > 0) {
					const onEvent = onEvents.shift();
					const origOnEvent = onEvent.event;
					let endNoteFound = false;
					let noteLength = events.slice(onEvent.index + 1).reduce(function(sum, event) {
						if (endNoteFound) return sum;
						if (event.note === origOnEvent.note && event instanceof MidiNoteOffEvent) endNoteFound = true;
						return sum + event.delta;
					}, 0);

					noteLength += midiEvent.delta;

					const updatedMidiOnEvent = new MidiNoteOnEvent({
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
