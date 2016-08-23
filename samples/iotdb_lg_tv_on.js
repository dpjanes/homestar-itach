const iotdb = require("iotdb")
iotdb.use("homestar-itach-ir")

const things = iotdb.connect('ir-lg-tv-on')
things.set(":on", true);
