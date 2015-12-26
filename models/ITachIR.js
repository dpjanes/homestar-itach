/*
 *  ITachIR.js
 *
 *  David Janes
 *  IOTDB
 *  2015-06-27
 */

var iotdb = require("iotdb");

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
