/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
'use strict';

var utils = require('funtils'),
    curry = utils.curry;

var constants = require('./midi-constants.js'),
    HIGHBIT_MASK = constants.HIGHBIT_MASK,
    BYTE_MASK = constants.BYTE_MASK,
    META_EVENT = constants.META_EVENT,
    SYSEX_EVENT_MASK = constants.SYSEX_EVENT_MASK,
    NOTE_ON_MASK = constants.NOTE_ON_MASK,
    NOTE_OFF_MASK = constants.NOTE_OFF_MASK;

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

var isMetaEvent = generateMatcher(META_EVENT);
var isSysexEvent = generateMatcher(SYSEX_EVENT_MASK);

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

function isNoteControlEvent(code) {
   return 0xb0 <= code && code <= 0xbf;
}

function isProgramChangeEvent(code) {
   return 0xc0 <= code && code <= 0xcf;
}

function isChannelAftertouchEvent(code) {
   return 0xd0 <= code && code <= 0xdf;
}

function isPitchBendEvent(code) {
   return 0xe0 <= code && code <= 0xef;
}

function isChannelEvent(code) {
   return isNoteEvent(code) || 
          isPolyphonicAftertouchEvent(code) || 
          isNoteControlEvent(code) || 
          isProgramChangeEvent(code) || 
          isChannelAftertouchEvent(code) || 
          isPitchBendEvent(code);
}

function isVariableEvent(code) {
   return isMetaEvent(code) || isSysexEvent(code);
}

function isValidEventCode(code) {
   if (isMetaEvent(code)) return true;
   if (isChannelEvent(code)) return true;
   if (isSysexEvent(code)) return true;

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
    isChannelEvent: isChannelEvent
};
