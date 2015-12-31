exports.config =
  files:
    javascripts:
      joinTo: 'hexagon.js'
    stylesheets:
      joinTo: 'hexagon.css'
    templates:
      joinTo: 'hexagon.js'
  plugins:
    assetsmanager:
      copyTo:
        fonts: ['app/fonts/*']
      minTimeSpanSeconds: 120
