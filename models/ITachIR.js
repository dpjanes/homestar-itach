/*
 *  ITachIR.js
 *
 *  David Janes
 *  IOTDB
 *  2015-06-27
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('ITachIR')
    .facet(":bridge.ir")
    .name("ITachIR")
    .description("iTach IR Controller")
    .o("command", iotdb.string)
    .o("band", iotdb.number)
    .make();

exports.binding = {
    bridge: require('../ITachIRBridge').Bridge,
    model: exports.Model,
};
