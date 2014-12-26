webfont-dl
==========

Webfont Downloader.

Downloads a set of web fonts specified by `@font-face` rules in a CSS file. By default, `woff` equivalents are inlined (since the modern browsers all support it).

Examples:

Download "Crimson Text" in 400/normal and 400/italic and "Raleway" in 500/normal from Google's font API. Inlines .woff format files, puts the CSS and fonts into css/

    node webfont-dl.js "http://fonts.googleapis.com/css?family=Crimson+Text:400,400italic|Raleway:500" \
      -o css/font.css
  
Download "Crimson Text" in 400/normal and 400/italic and "Raleway" in 500/normal from Google's font API. Doesn't inline any files, puts CSS into css/, and fonts in font/

    node webfont-dl.js "http://fonts.googleapis.com/css?family=Crimson+Text:400,400italic|Raleway:500" \
      -o css/font.css --font-out=font --css-rel=/font --woff=link
