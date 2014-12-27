var crypto = require('crypto');
var fs = require('fs');
var url = require('url');
var path = require('path');
var Q = require('q');

var log = require('./log');

function toDataURL(mimeType, buffer, url) {
  return "data:" + mimeType + ";base64," + buffer.toString('base64') + (url.hash ? url.hash : "");  
}

function computeFilename(src, font, parsed, body) {
  var fmt = src.fmt;
  var sha1 = crypto.createHash('sha1').update(body).digest('hex');
  var ext = path.extname(parsed.pathname);

  if (fmt && !ext) {
      log.debug("Inferring extension '." + fmt.ext + "' based on format '" + src.format + "'");
      ext = '.' + fmt.ext;
  }

  var filename = font.font.family.toLowerCase().replace(/[^a-z]/g, "") + "-" + sha1 + ext;
  return filename;
}

function writeFont(opts, src, font, body) {
  var promise = Q.defer();
  var parsed = url.parse(src.url);
  var asData = false;
  var fmt = src.fmt;

  if (fmt && opts.modes[fmt.ext] == "data") {
    log.debug("Converting " + fmt.ext + " font " + font.font.getId() + " to data, mime-type '" + fmt.mime[0] + "'");
    src.url = toDataURL(fmt.mime[0], body, parsed);
    promise.resolve();
    return promise.promise;
  }

  var filename = computeFilename(src, font, parsed, body);
  src.url = opts.cssRel + filename + (parsed.hash && fmt.hash ? parsed.hash : "");

  log.debug("Writing " + opts.fontOut + "/" + filename);
  fs.writeFile(opts.fontOut + "/" + filename, body, function(error) {
    promise.resolve();
  });

  return promise.promise;
}

exports.writeFont = writeFont;
