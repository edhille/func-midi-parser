/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
/* globals describe: true, before: true, beforeEach: true, afterEach: true, it: true, Uint8Array: true, xit: true */
'use strict';

var chai = require('chai'),
    MidiDataTypes = require('../lib/data-types.js');

describe('Midi Data Types', function () {

    var expect = chai.expect;

    chai.should();

    describe('Midi', function() {
        var Midi = MidiDataTypes.Midi,
            midi = null;

        describe('error cases', function () {

            beforeEach(function () {
                midi = new Midi({});
            });

            it('should throw an error if you try to modify it\'s header property', function () {
                expect(function () {
                    midi.header = 'FAIL';
                }).to.throw(TypeError);
            });

            it('should throw an error if you try to modify it\'s tracks property', function () {
                expect(function () {
                    midi.tracks = 'FAIL';
                }).to.throw(TypeError);
            });
        });

        describe('valid cases', function () {
            
            beforeEach(function () {
                midi = new Midi({
                    header: 'HEADER',
                    tracks: ['TRACKS']
                });
            });

            it('should have an instance', function () {
                (midi instanceof Midi).should.be.true;
            });
        });
    });

    describe('MidiHeader', function() {
        var MidiHeader = MidiDataTypes.MidiHeader,
            header = null;

        describe('error cases', function () {

            beforeEach(function () {
               header = new MidiHeader({});
            });

            it('should throw an error', function () {
                expect(function () {
                    header.fail = 'yup';
                }).to.throw(TypeError);
            });
        });

        describe('valid cases', function () {

            beforeEach(function () {
               header = new MidiHeader({});
            });

            it('should have an instance', function () {
                (header instanceof MidiHeader).should.be.true;
            });
        });
    });

    describe('MidiTrack', function() {
        var MidiTrack = MidiDataTypes.MidiTrack,
            track = null;

        describe('error cases', function () {

            beforeEach(function () {
                track = new MidiTrack({});    
            });

            it('should throw an error', function () {
                expect(function () {
                    track.fail = 'yup';
                }).to.throw(TypeError);
            });
        });

        describe('valid cases', function () {

            beforeEach(function () {
                track = new MidiTrack({});    
            });

            it('should have an instance', function () {
                (track instanceof MidiTrack).should.be.true;
            });
        });
    });

    describe('MidiEvent', function() {
        var MidiEvent = MidiDataTypes.MidiEvent,
            event = null;

        describe('error cases', function () {

            beforeEach(function () {
                event = new MidiEvent({});    
            });

            it('should throw an error', function () {
                expect(function () {
                    event.fail = 'yup';
                }).to.throw(TypeError);
            });
        });

        describe('valid cases', function () {

            beforeEach(function () {
                event = new MidiEvent({});
            });

            it('should have an instance', function () {
                (event instanceof MidiEvent).should.be.true;
            });
        });
    });

    describe('MidiMetaEvent', function() {
        var MidiMetaEvent = MidiDataTypes.MidiMetaEvent,
            MidiEvent = MidiDataTypes.MidiEvent,
            metaEvent = null;

        describe('error cases', function () {

            beforeEach(function () {
                metaEvent = new MidiMetaEvent({});    
            });

            it('should throw an error', function () {
                expect(function () {
                    metaEvent.fail = 'yup';
                }).to.throw(TypeError);
            });
        });

        describe('valid cases', function () {

            beforeEach(function () {
                metaEvent = new MidiMetaEvent({});    
            });

            it('should have an instance', function () {
                (metaEvent instanceof MidiMetaEvent);
            });

            it('should be an instance of MidiEvent', function () {
                (metaEvent instanceof MidiEvent);
            });
        });
    });

    describe('MidiMetaTempoEvent', function() {

        describe('error cases', function () {

            it('should throw an error');

            it('should not allow gibberish for dataBytes');
        });

        describe('valid cases', function () {

            it('should have an instance');

            it('should be an instance of');

            it('should have a tempo property');
        });
    });

    describe('MidiMetaTimeSignatureEvent', function() {

        describe('error cases', function () {

            it('should throw an error');
        });

        describe('valid cases', function () {

            it('should have an instance');

            it('should be an instance of');

            it('should have a time signature property');
        });
    });
});
