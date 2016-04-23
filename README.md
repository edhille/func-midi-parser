# func-midi-parser

[![Build Status](https://travis-ci.org/edhille/func-midi-parser.svg?branch=master)](https://travis-ci.org/edhille/func-midi-parser)

A simple, functional-based midi parsing library

## API Reference

<a name="module_midiParser"></a>
## midiParser
<a name="module_midiParser..parse"></a>
### midiParser~parse(midiBytes) ⇒ <code>Midi</code>
parses given array of unsigned 8-bit integers into Midi data type

**Kind**: inner method of <code>[midiParser](#module_midiParser)</code>  

| Param | Type | Description |
| --- | --- | --- |
| midiBytes | <code>array</code> | array of unsinged 8-bit integers representing raw midi data |



<a name="module_MidiConstants"></a>
## MidiConstants

* [MidiConstants](#module_MidiConstants)
    * [~BYTE_MASK](#module_MidiConstants..BYTE_MASK) : <code>number</code>
    * [~HIGHBIT_MASK](#module_MidiConstants..HIGHBIT_MASK) : <code>number</code>
    * [~SYSEX_EVENT_MASK](#module_MidiConstants..SYSEX_EVENT_MASK) : <code>number</code>
    * [~NOTE_ON_MASK](#module_MidiConstants..NOTE_ON_MASK) : <code>number</code>
    * [~NOTE_OFF_MASK](#module_MidiConstants..NOTE_OFF_MASK) : <code>number</code>
    * [~PROGRAM_MASK](#module_MidiConstants..PROGRAM_MASK) : <code>number</code>
    * [~CHANNEL_MASK](#module_MidiConstants..CHANNEL_MASK) : <code>number</code>
    * [~CONTROL_MASK](#module_MidiConstants..CONTROL_MASK) : <code>number</code>
    * [~META_EVENT](#module_MidiConstants..META_EVENT) : <code>number</code>
    * [~SEQUENCE_META_EVENT](#module_MidiConstants..SEQUENCE_META_EVENT) : <code>number</code>
    * [~TEXT_META_EVENT](#module_MidiConstants..TEXT_META_EVENT) : <code>number</code>
    * [~COPYRIGHT_META_EVENT](#module_MidiConstants..COPYRIGHT_META_EVENT) : <code>number</code>
    * [~TRACK_NAME_META_EVENT](#module_MidiConstants..TRACK_NAME_META_EVENT) : <code>number</code>
    * [~INST_NAME_META_EVENT](#module_MidiConstants..INST_NAME_META_EVENT) : <code>number</code>
    * [~LYRIC_TEXT_META_EVENT](#module_MidiConstants..LYRIC_TEXT_META_EVENT) : <code>number</code>
    * [~MARKER_TEXT_META_EVENT](#module_MidiConstants..MARKER_TEXT_META_EVENT) : <code>number</code>
    * [~CUE_POINT_META_EVENT](#module_MidiConstants..CUE_POINT_META_EVENT) : <code>number</code>
    * [~CHANNEL_PREFIX_ASSIGNMENT_META_EVENT](#module_MidiConstants..CHANNEL_PREFIX_ASSIGNMENT_META_EVENT) : <code>number</code>
    * [~END_OF_TRACK_META_EVENT](#module_MidiConstants..END_OF_TRACK_META_EVENT) : <code>number</code>
    * [~TEMPO_META_EVENT](#module_MidiConstants..TEMPO_META_EVENT) : <code>number</code>
    * [~SMPTE_OFFSET_META_EVENT](#module_MidiConstants..SMPTE_OFFSET_META_EVENT) : <code>number</code>
    * [~TIME_SIG_META_EVENT](#module_MidiConstants..TIME_SIG_META_EVENT) : <code>number</code>
    * [~KEY_SIGNATURE_META_EVENT](#module_MidiConstants..KEY_SIGNATURE_META_EVENT) : <code>number</code>
    * [~SEQUENCER_SPECIFIC_META_EVENT](#module_MidiConstants..SEQUENCER_SPECIFIC_META_EVENT) : <code>number</code>

<a name="module_MidiConstants..BYTE_MASK"></a>
### MidiConstants~BYTE_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>128</code>  
<a name="module_MidiConstants..HIGHBIT_MASK"></a>
### MidiConstants~HIGHBIT_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>127</code>  
<a name="module_MidiConstants..SYSEX_EVENT_MASK"></a>
### MidiConstants~SYSEX_EVENT_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>240</code>  
<a name="module_MidiConstants..NOTE_ON_MASK"></a>
### MidiConstants~NOTE_ON_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>144</code>  
<a name="module_MidiConstants..NOTE_OFF_MASK"></a>
### MidiConstants~NOTE_OFF_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>128</code>  
<a name="module_MidiConstants..PROGRAM_MASK"></a>
### MidiConstants~PROGRAM_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>192</code>  
<a name="module_MidiConstants..CHANNEL_MASK"></a>
### MidiConstants~CHANNEL_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>208</code>  
<a name="module_MidiConstants..CONTROL_MASK"></a>
### MidiConstants~CONTROL_MASK : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>176</code>  
<a name="module_MidiConstants..META_EVENT"></a>
### MidiConstants~META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>255</code>  
<a name="module_MidiConstants..SEQUENCE_META_EVENT"></a>
### MidiConstants~SEQUENCE_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>0</code>  
<a name="module_MidiConstants..TEXT_META_EVENT"></a>
### MidiConstants~TEXT_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>1</code>  
<a name="module_MidiConstants..COPYRIGHT_META_EVENT"></a>
### MidiConstants~COPYRIGHT_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>2</code>  
<a name="module_MidiConstants..TRACK_NAME_META_EVENT"></a>
### MidiConstants~TRACK_NAME_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>3</code>  
<a name="module_MidiConstants..INST_NAME_META_EVENT"></a>
### MidiConstants~INST_NAME_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>4</code>  
<a name="module_MidiConstants..LYRIC_TEXT_META_EVENT"></a>
### MidiConstants~LYRIC_TEXT_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>5</code>  
<a name="module_MidiConstants..MARKER_TEXT_META_EVENT"></a>
### MidiConstants~MARKER_TEXT_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>6</code>  
<a name="module_MidiConstants..CUE_POINT_META_EVENT"></a>
### MidiConstants~CUE_POINT_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>7</code>  
<a name="module_MidiConstants..CHANNEL_PREFIX_ASSIGNMENT_META_EVENT"></a>
### MidiConstants~CHANNEL_PREFIX_ASSIGNMENT_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>32</code>  
<a name="module_MidiConstants..END_OF_TRACK_META_EVENT"></a>
### MidiConstants~END_OF_TRACK_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>47</code>  
<a name="module_MidiConstants..TEMPO_META_EVENT"></a>
### MidiConstants~TEMPO_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>81</code>  
<a name="module_MidiConstants..SMPTE_OFFSET_META_EVENT"></a>
### MidiConstants~SMPTE_OFFSET_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>84</code>  
<a name="module_MidiConstants..TIME_SIG_META_EVENT"></a>
### MidiConstants~TIME_SIG_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>88</code>  
<a name="module_MidiConstants..KEY_SIGNATURE_META_EVENT"></a>
### MidiConstants~KEY_SIGNATURE_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>89</code>  
<a name="module_MidiConstants..SEQUENCER_SPECIFIC_META_EVENT"></a>
### MidiConstants~SEQUENCER_SPECIFIC_META_EVENT : <code>number</code>
**Kind**: inner constant of <code>[MidiConstants](#module_MidiConstants)</code>  
**Default**: <code>127</code>  


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
    * [~MidiMetaEvent](#module_MidiTypes..MidiMetaEvent)
        * [new MidiMetaEvent(params)](#new_module_MidiTypes..MidiMetaEvent_new)
    * [~MidiMetaTempoEvent](#module_MidiTypes..MidiMetaTempoEvent)
        * [new MidiMetaTempoEvent(params)](#new_module_MidiTypes..MidiMetaTempoEvent_new)
    * [~MidiMetaTimeSignatureEvent](#module_MidiTypes..MidiMetaTimeSignatureEvent)
        * [new MidiMetaTimeSignatureEvent(params)](#new_module_MidiTypes..MidiMetaTimeSignatureEvent_new)
    * [~MidiMetaInstrumentNameEvent](#module_MidiTypes..MidiMetaInstrumentNameEvent)
        * [new MidiMetaInstrumentNameEvent(params)](#new_module_MidiTypes..MidiMetaInstrumentNameEvent_new)
    * [~MidiMetaKeySignatureEvent](#module_MidiTypes..MidiMetaKeySignatureEvent)
        * [new MidiMetaKeySignatureEvent(params)](#new_module_MidiTypes..MidiMetaKeySignatureEvent_new)
    * [~MidiMetaSmptOffsetEvent](#module_MidiTypes..MidiMetaSmptOffsetEvent)
        * [new MidiMetaSmptOffsetEvent(params)](#new_module_MidiTypes..MidiMetaSmptOffsetEvent_new)
    * [~MidiMetaTrackNameEvent](#module_MidiTypes..MidiMetaTrackNameEvent)
        * [new MidiMetaTrackNameEvent(params)](#new_module_MidiTypes..MidiMetaTrackNameEvent_new)
    * [~MidiMetaEndOfTrack](#module_MidiTypes..MidiMetaEndOfTrack)
        * [new MidiMetaEndOfTrack()](#new_module_MidiTypes..MidiMetaEndOfTrack_new)
    * [~MidiSystemEvent](#module_MidiTypes..MidiSystemEvent)
        * [new MidiSystemEvent()](#new_module_MidiTypes..MidiSystemEvent_new)
    * [~MidiChannelEvent](#module_MidiTypes..MidiChannelEvent)
        * [new MidiChannelEvent(params)](#new_module_MidiTypes..MidiChannelEvent_new)
    * [~MidiPolyphonicAftertouchEvent](#module_MidiTypes..MidiPolyphonicAftertouchEvent)
        * [new MidiPolyphonicAftertouchEvent(params)](#new_module_MidiTypes..MidiPolyphonicAftertouchEvent_new)
    * [~MidiControlChangeEvent](#module_MidiTypes..MidiControlChangeEvent)
        * [new MidiControlChangeEvent(params)](#new_module_MidiTypes..MidiControlChangeEvent_new)
    * [~MidiProgramChangeEvent](#module_MidiTypes..MidiProgramChangeEvent)
        * [new MidiProgramChangeEvent(params)](#new_module_MidiTypes..MidiProgramChangeEvent_new)
    * [~MidiChannelAftertouchEvent](#module_MidiTypes..MidiChannelAftertouchEvent)
        * [new MidiChannelAftertouchEvent(params)](#new_module_MidiTypes..MidiChannelAftertouchEvent_new)
    * [~MidiPitchWheelEvent](#module_MidiTypes..MidiPitchWheelEvent)
        * [new MidiPitchWheelEvent(params)](#new_module_MidiTypes..MidiPitchWheelEvent_new)
    * [~MidiNoteEvent](#module_MidiTypes..MidiNoteEvent)
        * [new MidiNoteEvent(params)](#new_module_MidiTypes..MidiNoteEvent_new)
    * [~MidiNoteOnEvent](#module_MidiTypes..MidiNoteOnEvent)
        * [new MidiNoteOnEvent()](#new_module_MidiTypes..MidiNoteOnEvent_new)
    * [~MidiNoteOffEvent](#module_MidiTypes..MidiNoteOffEvent)
        * [new MidiNoteOffEvent()](#new_module_MidiTypes..MidiNoteOffEvent_new)

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

<a name="module_MidiTypes..MidiMetaEvent"></a>
### MidiTypes~MidiMetaEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaEvent_new"></a>
#### new MidiMetaEvent(params)
Abstract Midi meta event

**Returns**: MidiMetaEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.subtype | <code>string</code> | the type of meta event (i.e. "tempo", "time_signature", etc.) |

<a name="module_MidiTypes..MidiMetaTempoEvent"></a>
### MidiTypes~MidiMetaTempoEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaTempoEvent_new"></a>
#### new MidiMetaTempoEvent(params)
Meta tempo event

**Returns**: MidiMetaTempoEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.microsecPerQn | <code>number</code> | microseconds per quarter note |

<a name="module_MidiTypes..MidiMetaTimeSignatureEvent"></a>
### MidiTypes~MidiMetaTimeSignatureEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaTimeSignatureEvent_new"></a>
#### new MidiMetaTimeSignatureEvent(params)
Meta time signature event. Expects time signature to be
             represented by two numbers that take the form: nn/2^dd

**Returns**: MidiMetaTimeSignature  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.numerator | <code>number</code> | numerator for time signature |
| params.denominator | <code>number</code> | exponent for denominator of time signature |
| params.metronomeClicksPerTick | <code>number</code> | number of metronome clicks per midi tick |
| params.thirtySecondNotesPerBeat | <code>number</code> | number of 1/32 notes per beat |

<a name="module_MidiTypes..MidiMetaInstrumentNameEvent"></a>
### MidiTypes~MidiMetaInstrumentNameEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaInstrumentNameEvent_new"></a>
#### new MidiMetaInstrumentNameEvent(params)
Midi meta instrument name event

**Returns**: MidiMetaInstrumentNameEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |
| params.name | <code>string</code> | name of instrument used |

<a name="module_MidiTypes..MidiMetaKeySignatureEvent"></a>
### MidiTypes~MidiMetaKeySignatureEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaKeySignatureEvent_new"></a>
#### new MidiMetaKeySignatureEvent(params)
Midi meta key signature event

**Returns**: MidiMetaKeySignatureEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.sf | <code>number</code> | number of sharps/flats (-7 <= sf <= 7) |
| params.mi | <code>number</code> | major (0) or minor (1) |

<a name="module_MidiTypes..MidiMetaSmptOffsetEvent"></a>
### MidiTypes~MidiMetaSmptOffsetEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaSmptOffsetEvent_new"></a>
#### new MidiMetaSmptOffsetEvent(params)
Midi meta smpte offset event

**Returns**: MidiMeatSmpteOffsetEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.frameRate | <code>number</code> | top two bits define the frame rate in frames per second. If those bits are "00" (0 decimal), the frame rate is 24 frames per second. If those bits are "01" (1 decimal), the frame rate is 25 frames per second. If the bits are "10" (2 decimal), the frame rate is "drop 30" or 29.97 frames per second. If the top two bits are "11", then the frame rate is 30 frames per second. The six remaining bits define the hours of the SMPTE time (0-23). |
| params.min | <code>number</code> | minutes in offset (0-59) |
| params.sec | <code>number</code> | seconds in offset (0-59) |
| params.frames | <code>number</code> | depends upon framerate |
| params.subframes | <code>number</code> | 0-99 |

<a name="module_MidiTypes..MidiMetaTrackNameEvent"></a>
### MidiTypes~MidiMetaTrackNameEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaTrackNameEvent_new"></a>
#### new MidiMetaTrackNameEvent(params)
Midi meta track name event

**Returns**: MidiMetaTrackNameEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.name | <code>string</code> | name of the track |

<a name="module_MidiTypes..MidiMetaEndOfTrack"></a>
### MidiTypes~MidiMetaEndOfTrack
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiMetaEndOfTrack_new"></a>
#### new MidiMetaEndOfTrack()
Midi meta end of track event

**Returns**: MidiMetaEndOfTrackEvent  
<a name="module_MidiTypes..MidiSystemEvent"></a>
### MidiTypes~MidiSystemEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiSystemEvent_new"></a>
#### new MidiSystemEvent()
Abstract Midi system event

**Returns**: MidiSystemEvent  
<a name="module_MidiTypes..MidiChannelEvent"></a>
### MidiTypes~MidiChannelEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiChannelEvent_new"></a>
#### new MidiChannelEvent(params)
Abstract Midi channel event

**Returns**: MidiChannelEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | properties to set |
| params.eventCode | <code>number</code> | hex value for the event code (0x80-0xEF) |

<a name="module_MidiTypes..MidiPolyphonicAftertouchEvent"></a>
### MidiTypes~MidiPolyphonicAftertouchEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiPolyphonicAftertouchEvent_new"></a>
#### new MidiPolyphonicAftertouchEvent(params)
polyphonic aftertouch event

**Returns**: MidiPolyphonicAftertouchEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |

<a name="module_MidiTypes..MidiControlChangeEvent"></a>
### MidiTypes~MidiControlChangeEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiControlChangeEvent_new"></a>
#### new MidiControlChangeEvent(params)
control change event

**Returns**: MidiControlChangeEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |

<a name="module_MidiTypes..MidiProgramChangeEvent"></a>
### MidiTypes~MidiProgramChangeEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiProgramChangeEvent_new"></a>
#### new MidiProgramChangeEvent(params)
NOT YET IMPLEMENTED

**Returns**: MidiProgramChangeEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |

<a name="module_MidiTypes..MidiChannelAftertouchEvent"></a>
### MidiTypes~MidiChannelAftertouchEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiChannelAftertouchEvent_new"></a>
#### new MidiChannelAftertouchEvent(params)
NOT YET IMPLEMENTED

**Returns**: MidiChannelAftertouchEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |

<a name="module_MidiTypes..MidiPitchWheelEvent"></a>
### MidiTypes~MidiPitchWheelEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiPitchWheelEvent_new"></a>
#### new MidiPitchWheelEvent(params)
NOT YET IMPLEMENTED

**Returns**: MidiPitchWheelEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |

<a name="module_MidiTypes..MidiNoteEvent"></a>
### MidiTypes~MidiNoteEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiNoteEvent_new"></a>
#### new MidiNoteEvent(params)
Abstract note event

**Returns**: MidiNoteEvent  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | proprties to set |
| params.note | <code>number</code> | note (0-255) |
| params.velocity | <code>number</code> | velocity (0-127) |
| params.length | <code>number</code> | length in ms |

<a name="module_MidiTypes..MidiNoteOnEvent"></a>
### MidiTypes~MidiNoteOnEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiNoteOnEvent_new"></a>
#### new MidiNoteOnEvent()
note on event

**Returns**: MidiNoteOnEvent  
<a name="module_MidiTypes..MidiNoteOffEvent"></a>
### MidiTypes~MidiNoteOffEvent
**Kind**: inner class of <code>[MidiTypes](#module_MidiTypes)</code>  
<a name="new_module_MidiTypes..MidiNoteOffEvent_new"></a>
#### new MidiNoteOffEvent()
note off event

**Returns**: MidiNoteOffEvent  

