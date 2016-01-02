regJoin = (s) -> new RegExp(s.replace(/\//g, '[\\\/\\\\]'))

exports.config =
  public: 'public'
  files:
    javascripts:
      joinTo:
        'hexagon.js': [regJoin('^app/')]
        'vendor.js': [regJoin('^vendor/scripts/')]
    stylesheets:
      joinTo: 'hexagon.css'
    templates:
      joinTo: 'hexagon.js'
  plugins:
    assetsmanager:
      copyTo:
        fonts: ['app/fonts/*']
        audio: ['app/audio/*']
      minTimeSpanSeconds: 120
