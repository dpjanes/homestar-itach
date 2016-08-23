/*
 *  ITachIR.js
 *
 *  David Janes
 *  IOTDB
 *  2015-06-27
 *
 *  This will just send the "command"
 */

var iotdb = require("iotdb");
var _ = iotdb._;

exports.binding = {
    bridge: require('../ITachIRBridge').Bridge,
    model: require('./ir-itach.json'),
    discover: false
};
