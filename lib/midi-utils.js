/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
'use strict';

var constants = require('./midi-constants.js'),
    HIGHBIT_MASK = constants.HIGHBIT_MASK,
    BYTE_MASK = constants.BYTE_MASK;

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

module.exports = {
    parseByteArrayToNumber: parseByteArrayToNumber,
    toArr: toArr,
    toHex: toHex,
    parseStringFromRawChars: parseStringFromRawChars,
    parseNextVariableChunk: parseNextVariableChunk
};
