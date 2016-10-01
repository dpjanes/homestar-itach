/*
 *  IRAppleTV.js
 *
 *  David Janes
 *  IOTDB
 *  2015-06-28
 */

const iotdb = require("iotdb");
const _ = iotdb._;

const cmdd = require("../data/ir-apple-tv.json")

cmdd["shuttle.pause"] = cmdd["shuttle.play"];

exports.binding = {
    bridge: require('../../ITachIRBridge').Bridge,
    discover: false,
    model: require("./model.json"),
    metad: {
        "schema:name": "Apple TV",
        "schema:model": "http://store.apple.com/ca/appletv",
    },
    connectd: {
        data_out: function (paramd) {
            paramd.rawd.irs = [];

            for (var key in paramd.cookd) {
                var ir = cmdd[key];
                if (ir) {
                    paramd.rawd.irs.push(ir);
                }
            }
        }
    },
};
