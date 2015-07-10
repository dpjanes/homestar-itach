# 
#   codes2model.py
# 
#   David Janes
#   IOTDB.org
#   2015-06-27
#
#   This will convert Global Cache's "Control Tower" type
#   data into IOTDB Models
# 
#   Copyright [2013-2015] [David P. Janes]
# 
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

import string
import sys
import csv
import pprint
import os
import json

md = {}

def load_mapping():
    for key, value in json.load(open('map.json')).iteritems():
        if not value:
            pass
        elif isinstance(value, basestring):
            md[key] = [ value ]
        else:
            md[key] = value

def load_codes(in_path):
    header = None
    rowds = []

    with open(in_path, 'rb') as cin:
        creader = csv.reader(cin)
        for row in creader:
            if not row:
                continue

            row = map(string.strip, row)

            if header == None:
                if row and row[0] == "function":
                    header = row

                continue

            rowds.append(dict(zip(header, row)))

    out_name = os.path.basename(in_path)
    out_name, x = os.path.splitext(out_name)

    ird = {}
    ss = set()
    for rowd in rowds:
        name = rowd.get('function')
        value = rowd.get('code1')
        if not name or not value:
            continue

        name = name.lower()
        keys = md.get(name)
        if not keys:
            continue

        for key in keys:
            ird[key] = value

    return ird

def process_model(ird):
    print """\
var iotdb = require("iotdb");
var _ = iotdb._;

var cmdd = %(ird)s
""" % {
    "ird": json.dumps(ird, sort_keys=True, indent=4),
}

    print """\
exports.Model = iotdb.make_model('IRThing')
    // .facet(":")
    .name("IR Thing")
    .description("")"""

    has_band = False
    for key in sorted(ird.keys()):
        if key.startswith("band"):
            has_band = True
            continue

        print """    .action("iot-attribute:%s")""" % key

    if has_band:
        print """\
    .io("band",
        iotdb
            .make_string(":band")
            .enumeration(_.ld.expand(["""

        for key in sorted(ird.keys()):
            if key.startswith("band"):
                print """\
                "iot-attribute:%s",""" % key

        print """\
            ]))
    )"""

    print """\
    .make();

exports.binding = {
    bridge: require('../ITachIRBridge').Bridge,
    model: exports.Model,
    metad: {
        // "schema:name": "",
        // "schema:model": "",
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

            if (paramd.cookd.band) {
                var band = _.ld.compact(paramd.cookd.band);
                band = band.replace(/^iot-attribute:/, "");
                var ir = cmdd[band];
                if (ir) {
                    paramd.rawd.irs.push(ir);
                }
            }
        }
    },
};
"""


if __name__ == '__main__':
    load_mapping()

    for in_path in sys.argv[1:]:
        ird = load_codes(in_path)
        process_model(ird)
