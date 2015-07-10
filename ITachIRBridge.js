/*
 *  ITachIRBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-06-27
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var itach = require('node-itach');
var arp = require('iotdb-arp');

var logger = bunyan.createLogger({
    name: 'homestar-itach-ir',
    module: 'ITachIRBridge',
});


/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var ITachIRBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/ITachIRBridge/initd"), {
            host: null,
            mac: null,
            arp: true,
            ipd: {},
        }
    );
    self.native = native;   
    self.connectd = {
        data_out: function(paramd) {
        },
    }

    if (self.native) {
        self.queue = _.queue("ITachIRBridge");
    }

    self.arping = false;
};

ITachIRBridge.prototype = new iotdb.Bridge();

ITachIRBridge.prototype.name = function () {
    return "ITachIRBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
ITachIRBridge.prototype.discover = function () {
    var self = this;

    logger.info({
        method: "discover"
    }, "called");

    if (self.initd.host && self.initd.mac) {
        self._discover_host(self.initd);
    } else if (self.initd.arp) {
        self._discover_arp();
    }
};

ITachIRBridge.prototype._discover_arp = function () {
    var self = this;

    if (self.arping) {
        return;
    }
    self.arping = true;

    logger.info({
        method: "_discover_arp",
        initd: self.initd,
    }, "called");

    arp.browser({
        verbose: self.initd.verbose,
        poll: 3 * 60,
    }, function (error, arpd) {
        if (error) {
            return;
        } else if (!arpd) {
            return
        }

        if (!arpd.mac.match(/^00:0C:1E:/)) {
            return;
        } if (self.initd.ipd[arpd.ip]) {
            return;
        }

        self.initd.ipd[arpd.ip] = true;

        self._discover_host(_.defaults({
            host: arpd.ip,
            mac: arpd.mac,
            probe: false,
            retry: 0,
        }, self.initd));
    });
};

ITachIRBridge.prototype._discover_host = function (arpd) {
    var self = this;
    self.discovered(new ITachIRBridge(_.defaults(arpd, self.initd), {}));
};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
ITachIRBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }


    self._validate_connect(connectd);

    self.connectd = _.defaults(connectd, self.connectd, {});
};

ITachIRBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.initd.ipd[self.initd.host] = false;

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
ITachIRBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
ITachIRBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    if (!self.connectd.data_out) {
        done(new Error("'data_out' not implemented"));
        return;
    }

    logger.info({
        method: "push",
        pushd: pushd
    }, "push");

    var paramd = {
        rawd: {},
        cookd: pushd,
        scratchd: self.scratchd,
    };
    self.connectd.data_out(paramd);

    var irs = paramd.rawd.irs;
    if (!irs) {
        done();
        return;
    }

    var count = irs.length;

    irs.map(function(ir) {
        var qitem = {
            run: function () {
                self._itach().send({
                    ir: ir,
                    module: "3"
                }, function callback(error) {
                    if (error) {
                        console.log("#", error);
                    }
                });

                self.queue.finished(qitem);
            },
            coda: function() {
                if (--count === 0) {
                    done();
                }
            },
        };
        self.queue.add(qitem);
    });
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
ITachIRBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
ITachIRBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("ITachIR", self.initd.mac.replace(/:/g, '')),
        "schema:name": "ITachIR",

        // "iot:number": self.initd.number,
        // "iot:device": _.id.thing_urn.unique("ITachIR", self.native.uuid),
        // "schema:manufacturer": "",
        // "schema:model": "",
    };
};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
ITachIRBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
ITachIRBridge.prototype.configure = function (app) {};

/* -- internals -- */
var _itachd = {};

/**
 *  If you need a singleton to access the library
 */
ITachIRBridge.prototype._itach = function () {
    var self = this;
    var ip = self.initd.host;

    if (!_itachd[ip]) {
        _itachd[ip] = new itach({
            host: ip,
        });
    };

    return _itachd[ip];
};

/*
 *  API
 */
exports.Bridge = ITachIRBridge;

