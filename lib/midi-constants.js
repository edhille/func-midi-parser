'use strict';

/** @module MidiConstants */

// General helper constants

/** @constant
    @type {number}
    @default
*/
const BYTE_MASK = 0x80;

/** @constant
    @type {number}
    @default
*/
const HIGHBIT_MASK = 0x7f;

// Masks

/** @constant
    @type {number}
    @default
*/
const SYSEX_EVENT_MASK = 0xf0;

/** @constant
    @type {number}
    @default
*/
const NOTE_ON_MASK = 0x90;

/** @constant
    @type {number}
    @default
*/
const NOTE_OFF_MASK = 0x80;

/** @constant
    @type {number}
    @default
*/
const PROGRAM_MASK = 0xc0;

/** @constant
    @type {number}
    @default
*/
const CHANNEL_MASK = 0xd0;

/** @constant
    @type {number}
    @default
*/
const CONTROL_MASK = 0xb0;

// Matches

/** @constant
    @type {number}
    @default
*/
const META_EVENT = 0xff;

// Meta subtypes

/** @constant
    @type {number}
    @default
*/
const SEQUENCE_META_EVENT = 0x00;

/** @constant
    @type {number}
    @default
*/
const TEXT_META_EVENT = 0x01;

/** @constant
    @type {number}
    @default
*/
const COPYRIGHT_META_EVENT = 0x02;

/** @constant
    @type {number}
    @default
*/
const TRACK_NAME_META_EVENT = 0x03;

/** @constant
    @type {number}
    @default
*/
const INST_NAME_META_EVENT = 0x04;

/** @constant
    @type {number}
    @default
*/
const LYRIC_TEXT_META_EVENT = 0x05;

/** @constant
    @type {number}
    @default
*/
const MARKER_TEXT_META_EVENT = 0x06;

/** @constant
    @type {number}
    @default
*/
const CUE_POINT_META_EVENT = 0x07;

/** @constant
    @type {number}
    @default
*/
const CHANNEL_PREFIX_ASSIGNMENT_META_EVENT = 0x20;

/** @constant
    @type {number}
    @default
*/
const END_OF_TRACK_META_EVENT = 0x2f;

/** @constant
    @type {number}
    @default
*/
const TEMPO_META_EVENT = 0x51;

/** @constant
    @type {number}
    @default
*/
const SMPTE_OFFSET_META_EVENT = 0x54;

/** @constant
    @type {number}
    @default
*/
const TIME_SIG_META_EVENT = 0x58;

/** @constant
    @type {number}
    @default
*/
const KEY_SIGNATURE_META_EVENT = 0x59;

/** @constant
    @type {number}
    @default
*/
const SEQUENCER_SPECIFIC_META_EVENT = 0x7f;

module.exports = {
	BYTE_MASK: BYTE_MASK,
	HIGHBIT_MASK: HIGHBIT_MASK,
	SYSEX_EVENT_MASK: SYSEX_EVENT_MASK,
	NOTE_ON_MASK: NOTE_ON_MASK,
	NOTE_OFF_MASK: NOTE_OFF_MASK,
	PROGRAM_MASK: PROGRAM_MASK,
	CHANNEL_MASK: CHANNEL_MASK,
	CONTROL_MASK: CONTROL_MASK,
	META_EVENT: META_EVENT,
	SEQUENCE_META_EVENT: SEQUENCE_META_EVENT,
	TEXT_META_EVENT: TEXT_META_EVENT,
	COPYRIGHT_META_EVENT: COPYRIGHT_META_EVENT,
	TRACK_NAME_META_EVENT: TRACK_NAME_META_EVENT,
	INST_NAME_META_EVENT: INST_NAME_META_EVENT,
	LYRIC_TEXT_META_EVENT: LYRIC_TEXT_META_EVENT,
	MARKER_TEXT_META_EVENT: MARKER_TEXT_META_EVENT,
	CUE_POINT_META_EVENT: CUE_POINT_META_EVENT,
	CHANNEL_PREFIX_ASSIGNMENT_META_EVENT: CHANNEL_PREFIX_ASSIGNMENT_META_EVENT,
	END_OF_TRACK_META_EVENT: END_OF_TRACK_META_EVENT,
	TEMPO_META_EVENT: TEMPO_META_EVENT,
	SMPTE_OFFSET_META_EVENT: SMPTE_OFFSET_META_EVENT,
	TIME_SIG_META_EVENT: TIME_SIG_META_EVENT,
	KEY_SIGNATURE_META_EVENT: KEY_SIGNATURE_META_EVENT,
	SEQUENCER_SPECIFIC_META_EVENT: SEQUENCER_SPECIFIC_META_EVENT
};
