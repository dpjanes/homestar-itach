/*
 *  NOTE: prefer to do the way 'model.js' works
 *  Connect to a Denon AVR by searching MDNS/Bonjour
 */

"use strict";

var Bridge = require('../ITachIRBridge').Bridge;

var cmdd = {
    "lg.power.toggle": "sendir,1:1,1,37993,1,1,343,170,22,21,22,20,22,64,21,21,22,21,22,20,22,21,22,21,21,64,21,64,22,20,22,64,21,64,22,63,22,63,22,63,22,21,22,20,22,21,22,63,22,21,21,21,22,21,22,21,21,64,21,64,22,63,22,21,21,64,21,64,22,63,22,63,22,1520,343,85,21,3656,343,85,21,3655,342,85,21,3799",
    "lg.power.on": "sendir,1:1,1,38000,1,69,343,172,21,22,21,22,21,65,21,22,21,22,21,22,21,22,21,22,21,65,21,65,21,22,21,65,21,65,21,65,21,65,21,65,21,22,21,22,21,65,21,22,21,22,21,22,21,65,21,65,21,65,21,65,21,22,21,65,21,65,21,65,21,22,21,22,21,1673,343,86,21,3732",
    "lg.power.off": "sendir,1:1,1,38000,1,69,343,172,21,22,21,22,21,65,21,22,21,22,21,22,21,22,21,22,21,65,21,65,21,22,21,65,21,65,21,65,21,65,21,65,21,65,21,22,21,65,21,22,21,22,21,22,21,65,21,65,21,22,21,65,21,22,21,65,21,65,21,65,21,22,21,22,21,1673,343,86,21,3732",
};

if (process.argv.length !== 3) {
    console.log("usage: node connect_arp.js <command>");
    console.log("");
    console.log("commands:");

    for (var key in cmdd) {
        console.log("-", key);
    }

    process.exit(1);
}

var command = process.argv[2];
var sequence = cmdd[command];

var bridge_exemplar = new Bridge({
    arp: true,
});
bridge_exemplar.discovered = function (bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+ state-change", state);
    };
    bridge.connect({});
    console.log("+ send", command);
    bridge.push({
        command: sequence,
    }, function () {});
};
bridge_exemplar.discover();
