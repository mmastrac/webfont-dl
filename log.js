var log = {
  debug: function() {
    console.log.bind(console, "DEBUG").apply(null, arguments);
  },
  info: function() {
    console.log.bind(console, "INFO ").apply(null, arguments);
  },
}

exports.debug = log.debug;
exports.info = log.info;
