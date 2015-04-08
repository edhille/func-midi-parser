/* jshint expr: true */
/* globals describe: true, beforeEach: true, it: true */
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

            it('should have a "name" property that is empty', function () {
                track.name.should.equal('');
            });

            describe('when name is given', function () {
                beforeEach(function () {
                    track = new MidiTrack([], 'FOO');
                });

                it('should have a "name" property', function () {
                    track.name.should.equal('FOO');
                });
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
                expect(metaEvent).to.be.instanceof(MidiMetaEvent);
            });

            it('should be an instance of MidiEvent', function () {
                expect(metaEvent).to.be.instanceof(MidiEvent);
            });
        });
    });

    describe('MidiMetaTempoEvent', function() {
        var MidiMetaTempoEvent = MidiDataTypes.MidiMetaTempoEvent,
            MidiMetaEvent = MidiDataTypes.MidiMetaEvent,
            metaTempoEvent = null;

        describe('error cases', function () {

            describe('incomplete parameters', function () {

                it('should throw an error if we do not pass in dataBytes', function () {
                    expect(function () {
                        new MidiMetaTempoEvent({});
                    }).to.throw(TypeError);
                });
            });

            describe('invalid data', function () {

                beforeEach(function () {
                    metaTempoEvent = new MidiMetaTempoEvent({
                        dataBytes: ['foo', 'bar']
                    });
                });

                it('should convert gibberish for dataBytes to "0" tempo', function () {
                    metaTempoEvent.tempo.should.equal(0);
                });
            });
        });

        describe('valid cases', function () {

            beforeEach(function () {
                metaTempoEvent = new MidiMetaTempoEvent({
                    code: 0xFF,
                    subtype: 0x51,
                    dataBytes: [0x01, 0x02, 0x03, 0x04]
                });
            });

            it('should have an instance', function () {
                (metaTempoEvent instanceof MidiMetaTempoEvent).should.be.true;
            });

            it('should be an instance of MidiMetaEvent', function () {
                (metaTempoEvent instanceof MidiMetaEvent).should.be.true;
            });

            it('should have a tempo property calculated from "dataBytes"', function () {
                metaTempoEvent.tempo.should.equal(0x1020304);
            });
        });
    });

    describe('MidiMetaTimeSignatureEvent', function() {
        var MidiMetaTimeSignatureEvent = MidiDataTypes.MidiMetaTimeSignatureEvent,
            MidiMetaEvent = MidiDataTypes.MidiMetaEvent,
            metaTimeSignatureEvent = null;

        describe('error cases', function () {

            it('should throw an error if given no parameters', function () {
                expect(function () {
                    new MidiMetaTimeSignatureEvent();
                }).to.throw(TypeError);
            });

            it('should throw an error if you try to modify the "timeSignature"', function () {
                expect(function () {
                    metaTimeSignatureEvent = new MidiMetaTimeSignatureEvent({});
                    metaTimeSignatureEvent.timeSignature = 'fail';
                }).to.throw(TypeError);
            });
        });

        describe('valid cases', function () {

            beforeEach(function () {
                metaTimeSignatureEvent = new MidiMetaTimeSignatureEvent({
                    dataBytes: [0x01, 0x02, 0x03, 0x04]
                });
            });

            it('should have an instance', function () {
                (metaTimeSignatureEvent instanceof MidiMetaTimeSignatureEvent).should.be.true;
            });

            it('should be an instance of MidiMetaEvent', function () {
                (metaTimeSignatureEvent instanceof MidiMetaEvent).should.be.true;
            });

            it('should have a time signature property', function () {
                metaTimeSignatureEvent.timeSignature.should.be.defined;
            });
        });
    });

    describe('MidiChannelEvent', function () {
       var MidiChannelEvent = MidiDataTypes.MidiChannelEvent,
           MidiEvent = MidiDataTypes.MidiEvent,
           controllerEvent = null;

       describe('valid cases', function () {
          
          beforeEach(function () {
             controllerEvent = new MidiChannelEvent({
                type: 'meta',
                subtype: 'controller',
                channel: 4,
                dataBytes: [0x0, 0x7f]
             });
          });

          it('should have an instance', function () {
             (controllerEvent instanceof MidiChannelEvent).should.be.true;
          });

          it('should be an instance of MidiEvent', function () {
             (controllerEvent instanceof MidiEvent).should.be.true;
          });

          it('should have the correct channel', function () {
             controllerEvent.channel.should.equal(4);
          });

          it('should have the correct controllerType', function () {
             controllerEvent.controllerType.should.equal(0x0);
          });

          it('should have the correct value', function () {
             controllerEvent.value.should.equal(0x7f);
          });
       });
    });
});
