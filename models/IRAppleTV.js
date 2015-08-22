/*
 *  IRAppleTV.js
 *
 *  David Janes
 *  IOTDB
 *  2015-06-28
 */

var iotdb = require("iotdb");
var _ = iotdb._;

var cmdd = {
    "cursor.down": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1508,341,85,21,3648", 
    "cursor.left": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1508,341,85,21,3648", 
    "cursor.right": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,21,21,65,21,65,21,21,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1508,341,86,21,3648", 
    "cursor.up": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,21,21,65,21,21,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1508,341,85,21,3648", 
    "cursor.enter": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,65,21,21,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1508,341,85,21,3648", 
    "cursor.leave": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1508,341,85,21,3648", 
    "shuttle.play": "sendir,1:1,1,38000,1,69,341,172,21,21,21,65,21,65,21,65,21,21,21,65,21,65,21,65,21,65,21,65,21,65,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,65,21,21,21,21,21,21,21,21,21,21,21,65,21,65,21,21,21,21,21,21,21,65,21,21,21,21,21,1509,341,86,21,3649", 
};

cmdd["shuttle.pause"] = cmdd["shuttle.play"];

exports.Model = iotdb.make_model('IRAppleTV')
    .facet(":bridge.media")
    .name("IR Apple TV")
    .description("Apple TV via IR channel")
    .action("iot-purpose:cursor.down")
    .action("iot-purpose:cursor.left")
    .action("iot-purpose:cursor.right")
    .action("iot-purpose:cursor.up")
    .action("iot-purpose:cursor.enter")
    .action("iot-purpose:cursor.leave")
    .action("iot-purpose:shuttle.play")
    .action("iot-purpose:shuttle.pause")
    .make();

exports.binding = {
    bridge: require('../ITachIRBridge').Bridge,
    discover: false,
    model: exports.Model,
    metad: {
        "schema:name": "Apple TV",
        "schema:model": "http://store.apple.com/ca/appletv",
    },
    connectd: {
        data_out: function(paramd) {
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
