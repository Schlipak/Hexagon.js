exports.config =
  files:
    javascripts:
      joinTo: 'app.js'
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'app.js'
  plugins:
    assetsmanager:
      copyTo:
        fonts: ['app/fonts/*']
      minTimeSpanSeconds: 120
