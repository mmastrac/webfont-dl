webfont-dl
==========

Webfont Downloader.

Downloads a set of web fonts specified by `@font-face` rules in a CSS file. By default, `woff` equivalents are inlined (since the modern browsers all support it).

Example:

    # Download "Crimson Text" in 400/normal and 400/italic and "Raleway" in 500/normal
    node webfont-dl.js -"http://fonts.googleapis.com/css?family=Crimson+Text:400,400italic|Raleway:500" \
      -o css/font.css
  
