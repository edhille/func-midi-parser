/* vim: set expandtab ts=3 sw=3: */
/* jshint node: true, expr: true, es5: true */
'use strict';

module.exports = {
    BYTE_MASK: 0x80,
    HIGHBIT_MASK: 0x7F,
    META_EVENT: 0xFF,
    SYSEX_EVENT_MASK: 0xF0,
    NOTE_ON_MASK: 0x90,
    NOTE_OFF_MASK: 0x80,
    TEMPO_META_EVENT: 0x51,
    TIME_SIG_META_EVENT: 0x58,
    INST_NAME_META_EVENT: 0x04,
    END_OF_TRACK_META_EVENT: 0x2F
};
