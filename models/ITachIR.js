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
    .o("command", iotdb.string.purpose(":command"))
    .make();

exports.binding = {
    bridge: require('../ITachIRBridge').Bridge,
    model: require('./ITachIr.json'),
    discover: false,
    connectd: {
        data_out: function(paramd) {
            if (paramd.cookd.command) {
                paramd.rawd.irs = [ paramd.cookd.command, ];
            }
        }
    },
};
