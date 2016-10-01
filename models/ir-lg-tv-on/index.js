const iotdb = require("iotdb");
const _ = iotdb._;

const cmdd = require("./data/ir-lg-tv.json");

exports.binding = {
    bridge: require('../ITachIRBridge').Bridge,
    discover: false,
    model: require('./ir-lg-tv-on.json'),
    connectd: {
        data_out: function (paramd) {
            var ir;

            paramd.rawd.irs = [];

            for (var key in paramd.cookd) {
                ir = cmdd[key];
                if (ir) {
                    paramd.rawd.irs.push(ir);
                }
            }
        }
    },
};
