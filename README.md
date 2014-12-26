webfont-dl
==========

Web font downloader/inliner.

Downloads a set of web fonts specified by `@font-face` rules in a CSS file. By default, `woff` equivalents are inlined as [the modern browsers all support it](http://en.wikipedia.org/wiki/Web_Open_Font_Format).

By inlining `woff` files, this reduces the number of server roundtrips by two in the best case (the external CSS and `woff` files), one in the worst (just the external CSS). By reducing roundtrips we can reduce the amount of time we risk showing a flash of unstyled or hidden text content.

This tool is currently designed to work against Google's font server but should work against any hosted CSS font that uses `@font-face`.

Examples
========

Install it globally

    npm install -g webfont-dl

Download "Crimson Text" in 400/normal and 400/italic and "Raleway" in 500/normal from Google's font API. Inlines `woff` format files, puts the CSS and fonts into `css/`.

    webfont-dl "http://fonts.googleapis.com/css?family=Crimson+Text:400,400italic|Raleway:500" \
      -o css/font.css
  
Download "Crimson Text" in 400/normal and 400/italic and "Raleway" in 500/normal from Google's font API. Doesn't inline any files, puts CSS into `css/`, and fonts in `font/`.

    webfont-dl "http://fonts.googleapis.com/css?family=Crimson+Text:400,400italic|Raleway:500" \
      -o css/font.css --font-out=font --css-rel=/font --woff=link

Output
======

The CSS output from the tool contains a number of features:

  * The fonts are strongly named using a sha-1 hash
  * `local()` names are preserved from the input CSS
  * IE6-8 compatibility is enabled by hoisting a copy of `eot` files into a separate `src:` line
  * Selected font formats are inlined

Example output:

    @font-face {
      font-family: 'Crimson Text';
      font-style: normal;
      font-weight: 400;
      /* IE6-8 compat */
      src: url("/font/crimsontext-5a145c6f1863c2b986e33b7172a7059e4c6557dd.eot");
      src: local("Crimson Text"), 
        local("CrimsonText-Roman"), 
        url("data:application/font-woff;base64,...") format("woff"), 
        url("/font/crimsontext-5a145c6f1863c2b986e33b7172a7059e4c6557dd.eot") format("embedded-opentype"), 
        url("/font/crimsontext-528b74b55df7980a8f694e9a56d2feeaa1ae351e.svg#CrimsonText") format("svg"), 
        url("/font/crimsontext-381297740916b3fe12a631447ee8a802af3bea16.ttf") format("truetype");
    }

Usage
=====
    
    Web font downloader.
    
    Given a font definition file in webfontloader style, outputs a single CSS file
    and downloaded fonts in a given output directory.
    
    Usage: webfont <css-url-or-file> --out FILE [options]
    
    --help,-h           Prints help
    --out FILE,-o FILE  Output file for CSS
    --font-out=DIR      Font output directory [default: same folder as CSS]
    --css-rel=PATH      CSS-relative path for fonts [default: ./]
    --woff=<mode>       Processing mode for woff fonts: data, link or omit [default: data]
    --svg=<mode>        Processing mode for svg fonts: data, link or omit [default: link]
    --ttf=<mode>        Processing mode for ttf fonts: data, link or omit [default: link]
    --eot=<mode>        Processing mode for eot fonts: data, link or omit [default: link]
    -d                  Debug info [default: false]
