var url = require('url');
var css = require("css");
var fontFaceSrc = require('css-font-face-src');
var Q = require('q');

var log = require('./log');
var writeFont = require('./font-writer').writeFont;
var webRequest = require('./web-request').webRequest;

var FORMATS = {
  svg: {
    // iPad 1
    agent: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
    ext: 'svg',
    mime: ['image/svg+xml'],
    formats: ['svg'],
    // SVG uses the hash to determine which font is used
    hash: true,
    priority: 3,
    detect: '<?xml'
  },

  woff1: {
    // Modernish browser that supports WOFF but not WOFF2 (FF27)
    agent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
    ext: 'woff',
    mime: ['application/x-font-woff', 'application/font-woff', 'font/woff'],
    formats: ['woff'],
    hash: false,
    priority: 2,
    detect: 'wOFF'
  },

  woff2: {
    // Modern browser supporting WOFF2
    agent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/38.0.2125.104 Safari/537.36',
    ext: 'woff2',
    mime: ['application/x-font-woff2', 'application/font-woff2', 'font/woff2'],
    formats: ['woff2'],
    hash: false,
    priority: 1,
    detect: 'wOF2'
  },

  ttf: {
    // Android 2.2
    agent: 'Mozilla/5.0 (Linux; U; Android 2.2) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    ext: 'ttf',
    mime: ['application/font-ttf'],
    formats: ['truetype'],
    hash: false,
    priority: 5
  },

  eot: {
    // IE8
    agent: 'User-Agent: Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0)',
    ext: 'eot',
    mime: ['application/vnd.ms-fontobject'],
    formats: ['embedded-opentype', 'eot'],
    hash: false,
    priority: 4
  }
}

function parseFontRule(rule) {
  var font = { 
    family: "", 
    weight: "normal", 
    style: "normal", 
    src: [], 
    getId: function() { return this.family + "/" + this.style + "/" + this.weight } 
  };

  rule.declarations.forEach(function(declaration) {
    switch (declaration.property) {
      case 'src':
        var face = fontFaceSrc.parse(declaration.value);
        font.src = face;
        break;
      case 'font-family':
        font.family = declaration.value;
        break;
      case 'font-weight':
        font.weight = declaration.value;
        break;
      case 'font-style':
        font.style = declaration.value;
        break;
    }
  });

  font.src.forEach(function(src) {
    Object.keys(FORMATS).forEach(function(type) {
      var fmt = FORMATS[type];

      if (src.format && fmt.formats.indexOf(src.format) != -1) {
        src.fmt = fmt;
        return;
      }

      if (!src.format && src.url) {
        // Attempt to locate a format by guessing
        if (src.url.match(FORMATS[type].ext + "$")) {
          src.format = fmt.formats[0];
          src.fmt = fmt;
          log.debug("Guessing format of " + src.url + " to be '" + type + "' based on extension.");
          return;
        }

        if (src.url.slice(0, 5) == 'data:') {
          var header = src.url.split(',', 1)[0];
          fmt.mime.forEach(function(mime) {
            if (header.indexOf(mime) != -1) {
              src.format = fmt.formats[0];
              src.fmt = fmt;
              log.debug("Guessing format of " + font.getId() + " to be '" + type + "' based on mimetype.");
            }
          });
        }
      };
    });

    if (src.format && !src.fmt)
      log.debug("Unknown format '" + src.format + "' for " + src.url);
  });

  return font;
}

function downloadCssFile(fonts, opts, format) {
  log.info("Downloading " + opts.css + " using " + format.ext + " user-agent ...");
  return webRequest(opts.css, format.agent).then(function(body) {
    var parsed = css.parse(body.toString());
    parsed.stylesheet.rules.forEach(function(rule) {
      if (rule.type != "font-face")
        return;

      var font = parseFontRule(rule);      
      var fontId = font.getId();

      if (!fonts[fontId]) {
        fonts[fontId] = { font: { family: font.family, weight: font.weight, style: font.style, getId: font.getId }, src: {} };
      }

      font.src.forEach(function(src) {
        fonts[fontId].src[JSON.stringify(src)] = src;
      });
    });

    return fonts;
  });
}

function downloadFontDefs(opts) {
  var fonts = {};
  var promises = [];

  // Attempt to locate all font types by downloading the CSS in the same format using 
  // different user-agents
  Object.keys(FORMATS).forEach(function(type) {
    if (opts.modes[type] == "omit")
      return;

    promises.push(downloadCssFile(fonts, opts, FORMATS[type]));
  });
  
  return Q.all(promises).then(function() {
    var output = [];
    Object.keys(fonts).forEach(function(font) {
      var src = [];
      Object.keys(fonts[font].src).forEach(function(key) {
        src.push(fonts[font].src[key]);
      });
      output.push({ font: fonts[font].font, src: src });
    });
    return output;
  });
}

function checkFormat(font, src, body) {
  if (src.fmt.detect) {
    if (body.slice(0, src.fmt.detect.length).toString() == src.fmt.detect) {
      // All good, matches this format
      log.debug("Confirmed format " + src.format + " based on contents.");
      return body;
    }
  }

  Object.keys(FORMATS).forEach(function(type) {
    var fmt = FORMATS[type];
    if (fmt.detect) {
      if (body.slice(0, fmt.detect.length).toString() == fmt.detect) {
        src.format = fmt.formats[0];
        log.info("Updating format of '" + font.font.getId() + "' to " + src.format + " based on contents.");
      }
    }
  });

  return body;
}

function downloadFont(opts, font, src) {
  var resolved = url.resolve(opts.css, src.url);
  log.info("Downloading " + font.font.getId() + " (" + src.format + ")...");
  
  return webRequest(resolved, null)
    .then(checkFormat.bind(null, font, src))
    .then(writeFont.bind(null, opts, src, font));
}

function downloadFonts(opts, fonts) {
  var promises = [];
  fonts.forEach(function(font) {
    font.src.forEach(function(src) {
      if (src.url) {
        promises.push(downloadFont(opts, font, src));
      }
    });
  });

  return Q.all(promises).then(function() {
    return fonts;
  });
}

function downloadCss(opts) {
  return downloadFontDefs(opts)
    .then(downloadFonts.bind(null, opts));
}

exports.downloadCss = downloadCss;
