# func-midi-parser

[![Build Status](https://travis-ci.org/edhille/func-midi-parser.svg?branch=master)](https://travis-ci.org/edhille/func-midi-parser)

A simple, functional-based midi parsing library

## API Reference

<a name="module_MidiTypes"></a>
## MidiTypes

* [MidiTypes](#module_MidiTypes)
    * [~Midi](#module_MidiTypes..Midi)
        * [new Midi(params)](#new_module_MidiTypes..Midi_new)
    * [~MidiHeader](#module_MidiTypes..MidiHeader)
        * [new MidiHeader(params)](#new_module_MidiTypes..MidiHeader_new)
    * [~MidiTrack](#module_MidiTypes..MidiTrack)
        * [new MidiTrack(params)](#new_module_MidiTypes..MidiTrack_new)
    * [~MidiEvent](#module_MidiTypes..MidiEvent)
        * [new MidiEvent(params)](#new_module_MidiTypes..MidiEvent_new)

<a name="module_MidiTypes..Midi"></a>
### MidiTypes~Midi
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..Midi_new"></a>
#### new Midi(params)
top-level data type representing entire Midi song

**Returns**: Midi  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.header | <code>MidiHeader</code> | header data |
| params.tracks | <code>Array.&lt;MidiTrack&gt;</code> | array of MidiTracks |

<a name="module_MidiTypes..MidiHeader"></a>
### MidiTypes~MidiHeader
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiHeader_new"></a>
#### new MidiHeader(params)
header information for Midi song

**Returns**: MidiHeader  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.format | <code>number</code> | (0: single-track, 1: multi-track, simultaneous, 2: multi-track, independent) |
| params.trackCount | <code>number</code> | number of tracks (if multi-track) |
| params.timeDivision | <code>timeDivision</code> | the default unit of delta-time for this MIDI file |

<a name="module_MidiTypes..MidiTrack"></a>
### MidiTypes~MidiTrack
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiTrack_new"></a>
#### new MidiTrack(params)
information for a given track

**Returns**: MidiTrack  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>object</code> |  | properties to set |
| [params.name] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | label for the track |
| [params.events] | <code>Array.&lt;MidiEvent&gt;</code> | <code>[]</code> | array of MidiEvents |

<a name="module_MidiTypes..MidiEvent"></a>
### MidiTypes~MidiEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiEvent_new"></a>
#### new MidiEvent(params)
Abstract midi event class

**Returns**: MidiEvent  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>object</code> |  | properties to set |
| params.code | <code>number</code> |  | 0x80-0xFF code for the event |
| params.type | <code>string</code> |  | string label for the top-level "type" of event |
| params.subtype | <code>string</code> |  | string label for the second-level "type" of event |
| params.track | <code>number</code> |  | the index for the track this event belongs to |
| [params.delta] | <code>number</code> | <code>0</code> | delta offset in ??? (microseconds or milliseconds) from previous event |


