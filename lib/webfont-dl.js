var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

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
      console.log('Failure', err, err.stack);
    });
}

var modes = Object.keys(opts.modes);
modes.sort();
modes.forEach(function(mode) {
  console.log(" - " + mode + ": " + opts.modes[mode]);
})

mkdirp(path.dirname(opts.out), function(err) {
  if (!fs.existsSync(path.dirname(opts.out)) && err)
    throw new Error(err);
  mkdirp(opts.fontOut, function(err) {
    if (!fs.existsSync(opts.fontOut) && err)
      throw new Error(err);

    run(opts);
  });
});
