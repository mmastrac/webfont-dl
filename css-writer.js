var fs = require('fs');
var path = require('path');
var fontFaceSrc = require('css-font-face-src');
var Q = require('q');

var log = require('./log');

function serializeFont(font) {
  var sortedSrc = font.src.slice();

  sortedSrc.sort(function(a, b) {
    function score(x) {
      // Sort local items first
      if (x.local)
        return 0;
      // Between url items, data first
      if (x.url.slice(0, 4) == "data")
        return 1;
      return 2;
    }

    return score(a) - score(b);
  });

  var s = "";
  s += "@font-face {\n";
  s += "  font-family: " + font.font.family + ";\n";
  s += "  font-style: " + font.font.style + ";\n";
  s += "  font-weight: " + font.font.weight + ";\n";
  sortedSrc.forEach(function(src) {
    // IE compat
    if (src.url && (src.format == "embedded-opentype" || src.format == "eot")) {
      s += "  /* IE6-8 compat */\n";
      s += "  src: " + fontFaceSrc.serialize([{ url: src.url }]) + ";\n";
    }
  });
  s += "  src: " + fontFaceSrc.serialize(sortedSrc).replace(/\), /g, "), \n    ") + ";\n";
  s += "}\n\n";

  return s;
}

function writeCss(opts, fonts) {
  var s = "";
  fonts.forEach(function(font) {
    s += serializeFont(font);
  });

  var promise = Q.defer();
  fs.writeFile(opts.out, s, function(err) {
    promise.resolve();
  });

  return promise.promise;
}

exports.writeCss = writeCss;
