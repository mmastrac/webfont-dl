const neodoc = require('neodoc');
const path = require("path");

const doc = `
Web font downloader. 

Given a font definition file in webfontloader style, outputs a single CSS file 
and downloaded fonts in a given output directory.

usage: webfont-dl <css-url-or-file> --out=FILE [options]

options:
    --help,-h           Prints help
    --out=FILE -o FILE  Output file for CSS
    --font-out=DIR      Font output directory [default: --out]
    --css-rel=PATH      CSS-relative path for fonts [default: ./]
    --woff2=<mode>      Processing mode for woff v2 fonts: data, link or omit [default: data]
    --woff1=<mode>      Processing mode for woff v1 fonts: data, link or omit [default: link]
    --svg=<mode>        Processing mode for svg fonts: data, link or omit [default: omit]
    --ttf=<mode>        Processing mode for ttf fonts: data, link or omit [default: link]
    --eot=<mode>        Processing mode for eot fonts: data, link or omit [default: link]
    -d                  Debug info
`.trim();

exports.parse = function() {
	var opt = neodoc.run(doc, { version: '1.0' });
	var opts = { 
	  css: opt["<css-url-or-file>"],
	  out: opt["--out"],
	  fontOut: opt["--font-out"] == '--out' ? path.dirname(opt["--out"]) : opt["--font-out"],
	  cssRel: opt["--css-rel"] == "./" ? "" : (opt["--css-rel"] + "/"),
	  debug: Boolean(opt["-d"]),
	  modes: {
	    woff1: opt["--woff1"],
	    woff2: opt["--woff2"],
	    svg: opt["--svg"],
	    ttf: opt["--ttf"],
	    eot: opt["--eot"]
	  }
	};

	return opts;
};
