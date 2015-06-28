import string
import sys
import csv
import pprint
import os
import json

header = None
rowds = []

for in_path in sys.argv[1:]:
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

    d = {}
    ss = set()
    for rowd in rowds:
        name = rowd.get('function')
        value = rowd.get('code1')
        if not name or not value:
            continue

        name = name.lower()
        name = name.split()
        name = "iot-attribute:media." + ".".join(name)

        if name in ss:
            continue

        ss.add(name)
        d[name] = value

    print json.dumps(d, sort_keys=True, indent=2)
