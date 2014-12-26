var fs = require('fs');

var opts = require('./options').parse();

var writeCss = require('./css-writer').writeCss;
var downloadCss = require('./css-download').downloadCss;
var log = require('./log');

if (!opts.debug) {
  log.debug = function() {};
}

function run(opts) {
  downloadCss(opts)
    .then(writeCss.bind(null, opts))
    .then(function() {
      console.log("Done.");
    })
    .fail(function(err) {
      console.log(err);
    });
}

fs.mkdir(opts.fontOut, function(err) {
  run(opts);
});
