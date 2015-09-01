/* jshint expr: true */
/* globals describe: true, beforeEach: true, it: true, Uint8Array: true */
'use strict';

var chai = require('chai');
var midiUtils = require('../lib/midi-utils.js');
var constants = require('../lib/midi-constants.js');
var NOTE_ON_MASK = constants.NOTE_ON_MASK;

describe('midi utilities', function() {

	var expect = chai.expect;

	chai.should();

	describe('#toArr', function() {
		var toArr = midiUtils.toArr;

		describe('with Uint8Array', function() {
			var uint8Arr, simpleArr;

			beforeEach(function() {
				uint8Arr = new Uint8Array(2);

				uint8Arr[0] = 1;
				uint8Arr[2] = 2;

				simpleArr = toArr(uint8Arr, 0, uint8Arr.length);
			});

			it('should convert to simple "array"', function() {
				// here, we just see if it has metods available on an Array,
				// but not on Uint8Array
				simpleArr.map.should.be.defined;
			});

			it('should have same length as our original array', function() {
				simpleArr.length.should.equal(uint8Arr.length);
			});
		});

		describe('with empty Uint8Array', function() {
			var uint8Arr, simpleArr;

			beforeEach(function() {
				uint8Arr = new Uint8Array();

				simpleArr = toArr(uint8Arr, 0, uint8Arr.length);
			});

			it('should convert to simple "array"', function() {
				// here, we just see if it has metods available on an Array,
				// but not on Uint8Array
				simpleArr.map.should.be.defined;
			});

			it('should have same length as our original array', function() {
				simpleArr.length.should.equal(uint8Arr.length);
			});
		});
	});

	describe('#toHex', function() {
		var toHex = midiUtils.toHex;

		it('should convert any number to it\'s hex value', function () {
			expect(toHex(100)).to.equal('0x64');
		});

		it('should convert any non-number to 0x0', function () {
			expect(toHex('foo')).to.equal('0x0');
		});
	});

	describe('#parseByteArrayToNumber', function() {
		var parseByteArrayToNumber = midiUtils.parseByteArrayToNumber;

		describe('error cases', function() {

			it('should throw ane error if given no bytes', function() {
				expect(parseByteArrayToNumber).to.throw(TypeError);
			});
		});

		describe('when no "isVariable" flag is passed', function() {

			it('should return value of first array element if given array with only one element', function() {
				var testVal = 0xff;
				expect(parseByteArrayToNumber([testVal])).to.equal(testVal);
			});

			it('should shift/add multiple elements by 8 bits', function() {
				expect(parseByteArrayToNumber([0x1, 0x2])).to.equal(0x102);
			});
		});

		describe('when "isVariable" flag is passed', function() {

			it('should return value of first array element if given array with only one element', function() {
				var testVal = 0xff;
				expect(parseByteArrayToNumber([testVal]), true).to.equal(testVal);
			});

			it('should shift/add multiple elements', function() {
				expect(parseByteArrayToNumber([0x7f, 0xff]), true).to.equal(0x7fff);
			});
		});
	});

	describe('#parseStringFromRawChars', function() {
		var parseStringFromRawChars = midiUtils.parseStringFromRawChars;

		it('should convert an array of char bytes into a string', function () {
			expect(parseStringFromRawChars([102, 111, 111])).to.equal('foo');	
		});

		it('should throw if given empty arguments', function () {
			expect(parseStringFromRawChars).to.throw(TypeError);
		});

		it('should convert an empty array into an empty string', function () {
			expect(parseStringFromRawChars([])).to.equal('');
		});
	});

	describe('#parseNextVariableChunk', function() {
		// var parseNextVariableChunk = midiUtils.parseNextVariableChunk;

		it('should extract the ?? bytes from the given array');

		it('should return full array if there is no ??');
	});

	describe('#generateMatcher', function() {
		// var generateMatcher = midiUtils.generateMatcher;

		it('should correctly match an exact value');

		it('should correctly NOT match an invalid value');
	});

	describe('#generateMaskMatcher', function() {
		var generateMaskMatcher = midiUtils.generateMaskMatcher;
		var matcher = function() {};

		beforeEach(function() {
			matcher = generateMaskMatcher(NOTE_ON_MASK);
		});

		it('should match an event that bitwise ands with the mask', function() {
			// 0x91 is a "Chan 2 Note on" event
			matcher(0x91).should.be.true;
		});

		it('should not match an event that does not bitwise and with the mask', function() {
			matcher(0x51).should.be.false;
		});
	});

	describe('#isMetaEvent', function() {
		// var isMetaEvent = midiUtils.isMetaEvent;

		it('should reject an event below lower boundary');
		it('should accept an event in the boundary');
		it('should reject an event above upper boundary');
	});

	describe('#isSysexEvent', function() {
		// var isSysexEvent = midiUtils.isSysexEvent;

		it('should reject an event below lower boundary');
		it('should accept an event in the boundary');
		it('should reject an event above upper boundary');
	});

	describe('#isNoteOnEvent', function () {

		it('should correctly identify a note on event');

		it('should correctly reject a note off event');
	});

	describe('#isNoteOffEvent', function () {

		it('should correctly identify a note off event');

		it('should correctly reject a note on event');
	});
	
	describe('#isNoteEvent', function() {
		var isNoteEvent = midiUtils.isNoteEvent;

		it('should not match an event below lower bountdary', function() {
			isNoteEvent(0x7f).should.not.be.true;
		});

		it('should match a note off lower bountdary event', function() {
			isNoteEvent(0x80).should.be.true;
		});

		it('should match a note off upper bountdary event', function() {
			isNoteEvent(0x8f).should.be.true;
		});

		it('should match a note on lower bountdary event', function() {
			isNoteEvent(0x90).should.be.true;
		});

		it('should match a note on upper bountdary event', function() {
			isNoteEvent(0x9f).should.be.true;
		});

		it('should not match an event above upper bountdary', function() {
			isNoteEvent(0xa0).should.not.be.true;
		});
	});

	describe('#isPolyphonicAftertouchEvent', function () {

		it('should correctly identify a polyphonic aftertouch event');

		it('should correctly reject a non-polyphonic aftertouch event');
	});

	describe('#isControlChangeEvent', function () {

		it('should correctly identify a control change event');

		it('should correctly reject a non-control change event');
	});

	describe('#isChannelAftertouchEvent', function () {

		it('should correctly identify a channel aftertouch event');

		it('should correctly reject a non-channel aftertouch event');
	});

	describe('#isPitchWheelEvent', function () {

		it('should correctly identify a pitch wheel event');

		it('should correctly reject a non-pitch wheel event');
	});

	describe('#isChannelEvent', function() {
		// var isChannelEvent = midiUtils.isChannelEvent;

		it('should reject an event below lower boundary');
		it('should accept an event in the boundary');
		it('should reject an event above upper boundary');
	});

	describe('#isVariableEvent', function () {
		
	});

	describe('#isValidEventCode', function() {
		var isValidEventCode = midiUtils.isValidEventCode;

		it('should not match an event below lower boundary', function() {
			isValidEventCode(0x7f).should.not.be.true;
		});

		it('should match an event within boundary', function() {
			isValidEventCode(0xa0).should.be.true;
		});

		it('should not match an event above upper boundary', function() {
			isValidEventCode(0x101).should.not.be.true;
		});
	});
});

