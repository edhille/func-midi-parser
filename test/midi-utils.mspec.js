/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
/* globals describe: true, before: true, beforeEach: true, afterEach: true, it: true, Uint8Array: true, xit: true */
'use strict';

var chai = require('chai'),
    midiUtils = require('../lib/midi-utils.js'),
    constants = require('../lib/midi-constants.js'),
    NOTE_ON_MASK = constants.NOTE_ON_MASK;

describe('midi utilities', function () {

    var expect = chai.expect;

    chai.should();

    describe('#parseByteArrayToNumber', function () {
        var parseByteArrayToNumber = midiUtils.parseByteArrayToNumber;

        describe('error cases', function () {

            it('should throw ane error if given no bytes', function () {
                expect(parseByteArrayToNumber).to.throw(TypeError);
            });
        });

        describe('when no "isVariable" flag is passed', function () {

            it('should return value of first array element if given array with only one element', function () {
                var testVal = 0xff;
                expect(parseByteArrayToNumber([testVal])).to.equal(testVal);
            });

            it('should shift/add multiple elements by 8 bits', function () {
                expect(parseByteArrayToNumber([0x1, 0x2])).to.equal(0x102);
            });
        });

        describe('when "isVariable" flag is passed', function () {

            it('should return value of first array element if given array with only one element', function () {
                var testVal = 0xff;
                expect(parseByteArrayToNumber([testVal]), true).to.equal(testVal);
            });

            it('should shift/add multiple elements', function () {
                expect(parseByteArrayToNumber([0x7f, 0xff]), true).to.equal(0x7fff);
            });
        });
    });

    describe('#generateMaskMatcher', function () {
       var generateMaskMatcher = midiUtils.generateMaskMatcher,
           matcher = function () {},
           testMask = NOTE_ON_MASK;

       beforeEach(function () {
          matcher = generateMaskMatcher(NOTE_ON_MASK);
       });

       it('should match an event that bitwise ands with the mask', function () {
          // 0x91 is a "Chan 2 Note on" event
          matcher(0x91).should.be.true;
       });

       it('should match not an event that does not bitwise and with the mask', function () {
          matcher(0x51).should.be.false;
       });
    });
});
