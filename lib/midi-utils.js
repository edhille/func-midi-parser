'use strict';

const { curry } = require('funtils');

const {
	HIGHBIT_MASK,
	BYTE_MASK,
	META_EVENT
} = require('./midi-constants.js');

function toHex(item) {
	if (item instanceof Array) {
		return item.map((b) => '0x' + b.toString(16) );
	} else if (Number.isNaN(Number(item))) {
		return '0x0';
	} else {
		return '0x' + item.toString(16);
	}
}

function toArr(dataView, start, end) {
	return dataView.subarray(start, end);
}

function parseByteArrayToNumber(byteArray, isVariable) {
	const length = byteArray.length;

	return byteArray.reduce(function _buildNumber(number, oneByte, i) {
		const rawByteValue = isVariable ? oneByte & HIGHBIT_MASK : oneByte;
		const bitshiftedValue = rawByteValue << (length-i-1) * (isVariable ? 7 : 8);
		return number + bitshiftedValue;
	}, 0);
}

function parseStringFromRawChars(charArray) {
	if (typeof charArray === 'undefined') throw new TypeError('expected array of chars, but got undefined');

	return Array.prototype.slice.call(charArray).map((c) => String.fromCharCode(c) ).join('');
}

function parseNextVariableChunk(midiBytes) {
	function variableByteChunk(bytes) {
		if (bytes.length === 0) return [];

		const nByte = bytes[0];
		bytes = bytes.slice(1);

		if ((nByte & BYTE_MASK) !== BYTE_MASK) return [nByte];

		return [nByte].concat(variableByteChunk(bytes));
	}

	return variableByteChunk(midiBytes);
}

var generateMaskMatcher = curry(function _matchMask(bitMask) {
	return function _matchTestByte(testByte) {
		return (testByte & bitMask) === bitMask;
	};
});

var generateMatcher = curry(function _matcher(code) {
	return function _matchCode(testCode) {
		return testCode === code;
	};
});

const isMetaEvent = generateMatcher(META_EVENT);

function isSysexEvent(code) {
	return 0xf0 <= code && code <= 0xf7;
}

function isNoteOffEvent(code) {
	return 0x80 <= code && code <= 0x8f;
}

function isNoteOnEvent(code) {
	return 0x90 <= code && code <= 0x9f;
}

function isNoteEvent(code) {
	return isNoteOnEvent(code) || isNoteOffEvent(code);
}

function isPolyphonicAftertouchEvent(code) {
	return 0xa0 <= code && code <= 0xaf;
}

function isControlChangeEvent(code) {
	return 0xb0 <= code && code <= 0xbf;
}

function isProgramChangeEvent(code) {
	return 0xc0 <= code && code <= 0xcf;
}

function isChannelAftertouchEvent(code) {
	return 0xd0 <= code && code <= 0xdf;
}

function isPitchWheelEvent(code) {
	return 0xe0 <= code && code <= 0xef;
}

function isChannelEvent(code) {
	return isNoteEvent(code) || 
          isPolyphonicAftertouchEvent(code) || 
          isControlChangeEvent(code) || 
          isProgramChangeEvent(code) || 
          isChannelAftertouchEvent(code) || 
          isPitchWheelEvent(code);
}

// TODO: double-check that this is truly valid...
function isVariableEvent(code) {
	return isMetaEvent(code) || isSysexEvent(code);
}

function isValidEventCode(code) {
	if (isSysexEvent(code)) return true;
	if (isMetaEvent(code)) return true;
	if (isChannelEvent(code)) return true;

	return false;
}

module.exports = {
	toArr: toArr,
	toHex: toHex,
	parseByteArrayToNumber: parseByteArrayToNumber,
	parseStringFromRawChars: parseStringFromRawChars,
	parseNextVariableChunk: parseNextVariableChunk,
	generateMatcher: generateMatcher,
	generateMaskMatcher: generateMaskMatcher,
	isValidEventCode: isValidEventCode,
	isMetaEvent: isMetaEvent,
	isSysexEvent: isSysexEvent,
	isNoteOnEvent: isNoteOnEvent,
	isNoteOffEvent: isNoteOffEvent,
	isNoteEvent: isNoteEvent,
	isPolyphonicAftertouchEvent: isPolyphonicAftertouchEvent,
	isControlChangeEvent: isControlChangeEvent,
	isProgramChangeEvent: isProgramChangeEvent,
	isChannelAftertouchEvent: isChannelAftertouchEvent,
	isChannelEvent: isChannelEvent,
	isPitchWheelEvent: isPitchWheelEvent,
	isVariableEvent: isVariableEvent
};
