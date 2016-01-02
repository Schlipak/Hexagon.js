(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("Hexagon", function(exports, require, module) {
"use strict";

var Utils 			= require('src/Utils');
var RegularPolygon 	= require('src/RegularPolygon');
var Rays 			= require('src/Rays');
var Wall 			= require('src/Wall');
var Cursor 			= require('src/Cursor');
var Timer 			= require('src/Timer');
var Kiloton			= require('src/Kiloton');

var Hexagon;

module.exports = Hexagon = (function() {
	function Hexagon(args) {
		if (typeof args === 'undefined')
		throw new Error("No args provided");
		if (typeof args.canvas === 'undefined')
		throw new Error("No canvas provided");

		/* JS args */
		this.args = args;
		this.canvas = args.canvas;
		this.ctx = this.canvas.getContext('2d');

		/* JSON config */
		this.angleSpeed = 1.2;
		this.backgroundColors = [["#000000", "#000000"], ["#000000", "#000000"]];
		this.wallColors = ["#FFFFFF", "#FFFFFF"];
		this.wallSpeed = 5;
		this.rotationChance = 5;
		this.rotationFrequency = 5;

		/* Other members */
		this.walls = [null, null, null, null];
		this.currentWallColor = this.wallColors[0];
		this.currentBGC = this.backgroundColors[0];
		this.rays = new Rays({
			amount: 6
		});
		this.hexagon = new RegularPolygon({
			canvas: this.canvas,
			sides: 6,
			size: 1000
		});
		this.cursor = new Cursor({
			canvas: this.canvas,
			size: 7,
			color: this.wallColors[0],
			radius: 75,
			speed: 5
		});
		this.minDist = Math.sqrt(
			Math.pow(this.canvas.width, 2) +
			Math.pow(this.canvas.height, 2)
		) / 2;
		this.timer = new Timer({
			url: 'audio/rankup.wav'
		}).init(this.wallColors);

		/* Audio */
		this.audio_bgm = null;
		this.audio_start = new Audio('audio/start.wav');
		this.audio_die = new Audio('audio/die.wav');
		var _audio_ctx_ = new (window.AudioContext || window.webkitAudioContext);
		var _analyser_  = _audio_ctx_.createAnalyser();
		var _audio_src_ = null;
		var _audio_data_ = [];
		var _offset_ = 0;
		var _chunk_size_ = 0;

		/* Other vars */
		var _animation_id_,
		_frameCount = 0,
		_isDead = false,
		COLOR_DARK = 0, COLOR_LIGHT = 1;

		for (var i = 0; i < this.walls.length; i++) {
			this.walls[i] = new Wall({
				distance: this.minDist + ((this.minDist / 3) * (i + 1))
			});
			this.walls[i].generatePattern();
		};

		this.getAudioCtx = function() {return _audio_ctx_;}
		this.setAudioCtx = function(ctx) {_audio_ctx_ = ctx;}
		this.getAnalyser = function() {return _analyser_;}
		this.setAnalyser = function(a) {_analyser_ = a;}
		this.getAudioSrc = function() {return _audio_src_;}
		this.setAudioSrc = function(src) {_audio_src_ = src;}
		this.getAudioData = function() {return _audio_data_;}
		this.setAudioData = function(data) {_audio_data_ = data;}
		this.getChunkSize = function() {return _chunk_size_;}
		this.setChunkSize = function(size) {_chunk_size_ = size;}

		if (typeof this.args.config === 'string') {
			Kiloton.loadConfig(this.args.config, this, function() {
				if (this.audio_bgm)
				this.audio_bgm.play();
			}.bind(this));
		}

		this.init = function() {
			if (typeof this.args.config === 'string')
			Kiloton.loadConfig(this.args.config, this, function() {
				if (Math.floor(Date.now()) % 2 == 0)
				this.angleSpeed *= -1;
				if (this.audio_bgm)
				this.audio_bgm.play();
			}.bind(this));
			else {
				this.angleSpeed = 1.2;
				this.wallSpeed = 5;
				if (Math.floor(Date.now()) % 2 == 0)
				this.angleSpeed *= -1;
			}

			this.cursor.size = 7;
			this.timer.currentLevel = 0;
			this.timer.levelText.innerHTML = this.timer.levelTexts[0];
			_frameCount = 0;

			return this;
		};

		this.play = function() {
			var _this = this;
			_isDead = false;
			document.onkeydown = function(event) {
				var key = event.which || event.keyCode;
				if (key == 27)
				_isDead = true;
				_this.moveCursor(event);
			};
			document.onkeyup = function(event) {
				_this.stopCursor(event);
			}
			this.audio_start.play();
			setTimeout(function() {
				if (this.audio_bgm && this.audio_bgm.paused)
				this.audio_bgm.play();
			}.bind(this), 200);
			_animation_id_ = requestAnimationFrame(_update.bind(this))
		};

		this.moveCursor = function(event) {
			var key = event.which || event.keyCode;
			if (key == 39)
			this.cursor.dir = 1;
			else if (key == 37)
			this.cursor.dir = -1;
		}

		this.stopCursor = function(event) {
			var key = event.which || event.keyCode;
			if ((key == 39 && this.cursor.dir == 1) || (key == 37 && this.cursor.dir == -1))
			this.cursor.dir = 0;
		}

		this.die = function() {
			setTimeout(function() {
				if (this.audio_bgm) {
					this.audio_bgm.pause();
					this.audio_bgm = null;
				}
			}.bind(this), 200);
			this.audio_die.play();
			this.hexagon.draw(this.canvas, this.currentBGC[COLOR_DARK], this.currentWallColor, 7);
			this.cursor.draw();
			this.cursor.dir = 0;
			document.onkeydown = null;
			document.onkeyup = null;
			_frameCount = 0;
			_animation_id_ = requestAnimationFrame(_dead.bind(this));
		};

		var _update = function() {
			var _ending = this.timer.levelTimings[this.timer.levelTimings.length - 1];
			if (_frameCount >= (_ending * 60) && _frameCount <= ((_ending + .3) * 60)) {
				if (_frameCount == (_ending * 60) && typeof this.args.ending === 'string') {
					this.audio_bgm.pause();
					this.audio_bgm = null;
					Kiloton.loadConfig(this.args.ending, this, function() {
						this.audio_bgm.play();
					}.bind(this));
					for (var i = 0; i < this.walls.length; i++) {
						this.walls[i] = new Wall({
							distance: this.minDist + ((this.minDist / 3) * (i + 8))
						});
						this.walls[i].generatePattern();
					};
					this.audio_start.play();
				}
				this.ctx.fillStyle = "#FFFFFF";
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);
				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
				_frameCount++;
				_animation_id_ = requestAnimationFrame(_update.bind(this));
				return;
			}

			var _fc_acc = (_frameCount % 120) <= 60 ? (_frameCount % 120) : 60 - ((_frameCount % 120) - 60);
			if (_frameCount < 120) {
				this.currentWallColor = Utils.interpolateColor(
					this.currentWallColor,
					this.wallColors[0],
					120,
					_frameCount
				);
				this.currentBGC = [
					Utils.interpolateColor(
						this.currentBGC[COLOR_DARK],
						this.backgroundColors[0][COLOR_DARK],
						120,
						_frameCount
					),
					Utils.interpolateColor(
						this.currentBGC[COLOR_LIGHT],
						this.backgroundColors[0][COLOR_LIGHT],
						120,
						_frameCount
					)
				];
			} else {
				this.currentWallColor = Utils.interpolateColor(
					this.wallColors[0],
					this.wallColors[1],
					60,
					_fc_acc
				);
				this.currentBGC = [
					Utils.interpolateColor(
						this.backgroundColors[0][COLOR_DARK],
						this.backgroundColors[1][COLOR_DARK],
						60,
						_fc_acc
					),
					Utils.interpolateColor(
						this.backgroundColors[0][COLOR_LIGHT],
						this.backgroundColors[1][COLOR_LIGHT],
						60,
						_fc_acc
					)
				];
			}

			if ((_frameCount % (this.rotationFrequency * 60) == 0) && (Math.floor(Math.random() * 100)) < this.rotationChance)
			this.angleSpeed *= -1;

			if (this.audio_bgm) {
				_analyser_.getByteFrequencyData(_audio_data_);
				var __TEMP__ = _audio_data_.slice(_chunk_size_, _chunk_size_ * 2);
				_offset_ = (Utils.arrayAvg(__TEMP__) / 2);
			}

			this.ctx.fillStyle = this.currentBGC[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.currentBGC[COLOR_DARK], this.currentBGC[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor, _offset_);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern();
				}
				if (this.walls[i].checkCollision(this.cursor.getCoord(), this.canvas))
				_isDead = true;
			}
			this.cursor.color = this.currentWallColor;
			this.cursor.draw(_offset_);
			if (this.cursor.radius > 75)
			this.cursor.radius -= 25;
			if (this.cursor.size > 7)
			this.cursor.size -= 1;
			this.hexagon.draw(this.currentBGC[COLOR_DARK], this.currentWallColor, 7, _offset_);
			if (this.hexagon.size > 50)
			this.hexagon.size -= 25;
			this.timer.update(_frameCount, this.currentWallColor);

			if (_isDead)
			return this.die();

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_update.bind(this));
		};

		var _dead = function() {
			if (this.angleSpeed > .4) {
				this.angleSpeed -= .01;
				if (this.angleSpeed < .4)
				this.angleSpeed = .4;
			}
			else if (this.angleSpeed < -.4) {
				this.angleSpeed += .01;
				if (this.angleSpeed > -.4)
				this.angleSpeed = -.4;
			}
			if (this.wallSpeed > 0)
			this.wallSpeed = 0;

			if (_frameCount == (.5 * 60))
			this.wallSpeed = -50;
			if (_frameCount >= (.8 * 60) && this.hexagon.size < 250) {
				this.hexagon.size += 50;
				this.cursor.radius += 50;
				this.cursor.size += 1;
			}
			if (this.hexagon.size >= 250) {
				var _this = this;
				cancelAnimationFrame(_animation_id_);
				window.onkeydown = function(event) {
					var key = event.which || event.keyCode;
					if (key == 32 || key == 38) {
						for (var i = 0; i < _this.walls.length; i++) {
							_this.walls[i] = new Wall({
								distance: _this.minDist + ((_this.minDist / 3) * (i + 1))
							});
							_this.walls[i].generatePattern();
						};
						window.onkeydown = null;
						cancelAnimationFrame(_animation_id_);
						_this.init().play();
						return;
					};
				};
			}

			this.ctx.fillStyle = this.currentBGC[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.currentBGC[COLOR_DARK], this.currentBGC[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor, _offset_);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern();
				}
			}
			this.cursor.color = _frameCount % 6 < 3 ? this.wallColors[0] : this.wallColors[1];
			this.cursor.draw(_offset_);

			if (_frameCount > (.6 * 60)) {
				if (_offset_ < 0) {
					_offset_ += 1;
					if (_offset_ > 0)
					_offset_ = 0;
				} else if (_offset_ > 0) {
					_offset_ -= 1;
					if (_offset_ < 0)
					_offset_ = 0;
				}
			}

			this.hexagon.draw(this.currentBGC[COLOR_DARK], this.currentWallColor, 7, _offset_);

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_dead.bind(this));
		};

		return this;
	};

	return Hexagon;
}());

});

require.register("src/Cursor", function(exports, require, module) {
"use strict";

var Cursor;

module.exports = Cursor = (function() {
	function Cursor(args) {
		this.canvas = args.canvas || {};
		this.color = args.color || "#fff";
		this.size = args.size || 5;
		this.radius = args.radius || 50;
		this.speed = args.speed || 4;
		this.dir = 0;
		this.angle = 30;

		this.draw = function(offset) {
			var ctx = this.canvas.getContext('2d'),
			c_x = (this.canvas.width / 2) + ((this.radius + offset) * Math.cos(this.angle * Math.PI / 180)),
			c_y = (this.canvas.height / 2) + ((this.radius + offset) * Math.sin(this.angle * Math.PI / 180));

			this.angle = this.angle + (this.dir * this.speed);
			if (this.angle < 0)
				this.angle = 360 - this.angle;
			else if (this.angle > 360)
				this.angle %= 360;
			ctx.translate(c_x, c_y);
			ctx.rotate(this.angle * Math.PI / 180);
			ctx.translate(- c_x, - c_y);

			ctx.beginPath();
			ctx.moveTo(c_x - this.size, c_y - this.size);
			ctx.lineTo(c_x + this.size, c_y);
			ctx.lineTo(c_x - this.size, c_y + this.size);
			ctx.closePath();

			ctx.fillStyle = this.color;
			ctx.fill();

			ctx.translate(c_x, c_y);
			ctx.rotate(- this.angle * Math.PI / 180);
			ctx.translate(- c_x, - c_y);
		};

		this.getCoord = function() {
			var ctx = this.canvas.getContext('2d'),
			c_x = (this.canvas.width / 2) + (this.radius * Math.cos(this.angle * Math.PI / 180)),
			c_y = (this.canvas.height / 2) + (this.radius * Math.sin(this.angle * Math.PI / 180));

			return {
				a: this.angle,
				d: this.radius + (this.size * 2),
			};
		};
	};
	return Cursor;
}());

});

require.register("src/Kiloton", function(exports, require, module) {
"use strict";

var Utils = require('src/Utils');

var Kiloton = {
	loadConfig: function loadConfig(url, _this, callback) {
		var data = Utils.getJSON(url, function(data) {

			if (typeof data === 'undefined') {
				console.error("HexagonJS @ " + url + ": Can't get data.");
				return;
			}

			if (typeof data.game === 'undefined') {
				console.error("HexagonJS @ " + url + ": \"game\" object not found.");
				return;
			}

			if (typeof data.game.music !== 'undefined') {
				if (!_this.audio_bgm && typeof data.game.music === 'string') {
					_this.audio_bgm = new Audio(data.game.music);
					_this.audio_bgm.volume = 0.6;
					_this.setAudioSrc(_this.getAudioCtx().createMediaElementSource(_this.audio_bgm));
					_this.getAudioSrc().connect(_this.getAnalyser());
					_this.getAudioSrc().connect(_this.getAudioCtx().destination);
					_this.setAudioData(new Uint8Array(_this.getAnalyser().frequencyBinCount));		
					_this.setChunkSize(~~(_this.getAudioData().length / 3));
				} else
				console.error("HexagonJS @ " + url + ": \"music\" must be a string.");
			}

			if (typeof data.game.angleSpeed !== 'undefined') {
				if (typeof data.game.angleSpeed === 'number')
					_this.angleSpeed = data.game.angleSpeed;
				else
					console.error("HexagonJS @ " + url + ": \"angleSpeed\" must be a number.");
			}

			if (typeof data.game.wallSpeed !== 'undefined') {
				if (typeof data.game.wallSpeed === 'number') {
					if (data.game.wallSpeed > 0)
						_this.wallSpeed = data.game.wallSpeed;
					else
						console.error("HexagonJS @ " + url + ": \"wallSpeed\" must be a not null positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"wallSpeed\" must be a number.");
			}

			if (typeof data.game.cursorSpeed !== 'undefined') {
				if (typeof data.game.cursorSpeed === 'number') {
					if (data.game.cursorSpeed > 0)
						_this.cursor.speed = data.game.cursorSpeed;
					else
						console.error("HexagonJS @ " + url + ": \"cursorSpeed\" must be a not null positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"cursorSpeed\" must be a number.");
			}

			if (typeof data.game.rotationChance !== 'undefined') {
				if (typeof data.game.rotationChance === 'number') {
					if (data.game.rotationChance > 0)
						_this.rotationChance = data.game.rotationChance;
					else
						console.error("HexagonJS @ " + url + ": \"rotationChance\" must be a not null positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"rotationChance\" must be a number.");
			}

			if (typeof data.game.rotationFrequency !== 'undefined') {
				if (typeof data.game.rotationFrequency === 'number') {
					if (data.game.rotationFrequency > 0)
						_this.rotationFrequency = data.game.rotationFrequency;
					else
						console.error("HexagonJS @ " + url + ": \"rotationFrequency\" must be a not null positive number.");
				} else
				console.error("HexagonJS @ " + url + ": \"rotationFrequency\" must be a number.");
			}

			if (typeof data.game.backgroundColors !== 'undefined') {
				if (typeof data.game.backgroundColors === 'object') {
					if (data.game.backgroundColors.length == 2) {
						if (typeof data.game.backgroundColors[0] === 'object' &&
							typeof data.game.backgroundColors[1] === 'object') {
							if (data.game.backgroundColors[0].length != 2 ||
								data.game.backgroundColors[1].length != 2 ||
								typeof data.game.backgroundColors[0][0] !== 'string' ||
								typeof data.game.backgroundColors[0][1] !== 'string' ||
								typeof data.game.backgroundColors[1][0] !== 'string' ||
								typeof data.game.backgroundColors[1][1] !== 'string')
								console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain two arrays containing two strings.");
							else
								_this.backgroundColors = data.game.backgroundColors;
						} else
						console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain arrays of strings.");
					} else
					console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain two values.");
				} else
				console.error("HexagonJS @ " + url + ": \"backgroundColors\" must be an array of arrays of strings.");
			}

			if (typeof data.game.wallColors !== 'undefined') {
				if (typeof data.game.wallColors === 'object') {
					if (data.game.wallColors.length == 2) {
						if (typeof data.game.wallColors[0] === 'string' &&
							typeof data.game.wallColors[1] === 'string')
							_this.wallColors = data.game.wallColors;
						else
							console.error("HexagonJS @ " + url + ": \"wallColors\" must contain strings.");
					} else
					console.error("HexagonJS @ " + url + ": \"wallColors\" must contain two values.");
				} else
				console.error("HexagonJS @ " + url + ": \"wallColors\" must be an array of strings.");
			}

			if (typeof data.game.patterns === 'object') {
				for (var i = 0; i < data.game.patterns.length; i++) {
					if (typeof data.game.patterns[i] != 'object' || data.game.patterns[i].length != 6)
						console.error("HexagonJS @ " + url + ": \"patterns\" must be an array of arrays of 6 booleans.");
				}

				for (var i = _this.walls.length - 1; i >= 0; i--) {
					_this.walls[i].setPatterns(data.game.patterns);
					_this.walls[i].generatePattern();
				};
			}

			if (typeof data.levels !== 'undefined')
				_this.timer.load(data);

			if (typeof callback === 'function')
				callback();
		});
	}
};

module.exports = Kiloton;

});

require.register("src/Rays", function(exports, require, module) {
"use strict";

var Rays;

module.exports = Rays = (function() {
	function Rays(args) {
		this.amount = typeof args.amount !== 'undefined' ? args.amount : 3;

		this.draw = function(canvas, colors) {
			var ctx = canvas.getContext('2d'),
			cx = canvas.width / 2,
			cy = canvas.height / 2,
			sz = canvas.width > canvas.height ? canvas.width : canvas.height;

			for (var i = 1; i <= this.amount; i++) {
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + sz * Math.cos(i * 2 * Math.PI / this.amount), cy + sz * Math.sin(i * 2 * Math.PI / this.amount));
				ctx.lineTo(cx + sz * Math.cos((i+1)%this.amount * 2 * Math.PI / this.amount), cy + sz * Math.sin((i+1)%this.amount * 2 * Math.PI / this.amount));
				ctx.fillStyle = colors[i % 2];
				ctx.fill();
			}
		};
	};

	return Rays;
}());

});

require.register("src/RegularPolygon", function(exports, require, module) {
"use strict";

var RegularPolygon;

module.exports = RegularPolygon = (function() {
	function RegularPolygon(args) {
		if (typeof args === "undefined")
			throw new Error('RegularPolygon: No args provided');
		if (typeof args.canvas === 'undefined')
			throw new Error('RegularPolygon: No target canvas provided');
		if (typeof args.sides !== 'undefined' && args.sides < 3)
			throw new Error('RegularPolygon: Sides cannot be less than 3');

		this.sides = args.sides		|| 3,
		this.size = args.size		|| 10,
		this.canvas = args.canvas	|| {};

		this.draw = function(fillColor, strokeColor, strokeWidth, offset) {
			var ctx	= this.canvas.getContext('2d'),
			cx 	= this.canvas.width / 2 || 0,
			cy 	= this.canvas.height / 2 || 0;

			ctx.beginPath();
			ctx.moveTo(cx + (this.size + offset) * Math.cos(0), cy + this.size *  Math.sin(0));
			for (var i = 1; i <= this.sides; i++) {
				ctx.lineTo(cx + (this.size + offset) * Math.cos(i * 2 * Math.PI / this.sides), cy + (this.size + offset) * Math.sin(i * 2 * Math.PI / this.sides));
			};

			ctx.fillStyle = fillColor;
			ctx.strokeStyle = strokeColor;
			ctx.lineCap = "round";
			ctx.lineWidth = strokeWidth;
			ctx.fill();
			ctx.stroke();
		};

	};
	
	return RegularPolygon;
}());

});

require.register("src/Timer", function(exports, require, module) {
"use strict";

var Utils	= require('src/Utils');

var Timer;

module.exports = Timer = (function() {
	function Timer(args) {
		this.currentLevel = 0;
		this.levelTimings = [10, 20, 30, 45, 60];
		this.ending = this.levelTimings[this.levelTimings.length - 1];
		this.levelTexts = ["POINT", "LINE", "TRIANGLE", "SQUARE", "PENTAGON", "HEXAGON"];
		this.element;
		this.timeText;
		this.label;
		this.level;
		this.levelText;
		this.levelProgressContainer;
		this.levelProgress;

		this.notify = null;
		if (typeof args !== 'undefined' && typeof args.url !== 'undefined')
			this.notify = new Audio(args.url);

		this.load = function(data) {
			if (typeof data === 'undefined') {
				console.error("HexagonJS @ " + url + ": Can't get data.");
				return;
			}
			if (typeof data.levels === 'undefined') {
				console.error("HexagonJS @ " + url + ": \"levels\" object not found.");
				return;
			}
			if (typeof data.levels.timings === 'undefined' ||
				typeof data.levels.texts === 'undefined') {
				console.error("HexagonJS @ " + url + ": Missing \"timings\" or \"texts\" arrays.");
				return;
			}
			if (data.levels.timings.length != data.levels.texts.length - 1) {
				console.error("HexagonJS @ " + url + ": Level timings represent the end of each level. There should be one less timings than level names since the last level lasts forever.");
				return;
			}

			this.levelTimings = data.levels.timings;
			this.ending = this.levelTimings[this.levelTimings.length - 1];
			this.levelTexts = data.levels.texts;
			this.levelText.innerHTML = this.levelTexts[0];
		};

		this.init = function(colors) {
			this.element = document.createElement('div');
			this.element.classList.add('hjs');
			this.element.classList.add('timer');
			document.getElementsByTagName('body')[0].appendChild(this.element);

			this.timeText = document.createElement('span');
			this.element.appendChild(this.timeText);

			this.label = document.createElement('div');
			this.label.classList.add('hjs');
			this.label.classList.add('label');
			this.label.innerHTML = "TIME";
			this.element.appendChild(this.label);

			this.level = document.createElement('div');
			this.level.classList.add('hjs');
			this.level.classList.add('level');
			document.getElementsByTagName('body')[0].appendChild(this.level);

			this.levelText = document.createElement('span');
			this.levelText.innerHTML = this.levelTexts[0];
			this.level.appendChild(this.levelText);

			this.levelProgressContainer = document.createElement('div');
			this.level.appendChild(this.levelProgressContainer);

			this.levelProgress = document.createElement('div');
			this.levelProgress.style.backgroundColor = colors[1];
			this.levelProgressContainer.appendChild(this.levelProgress);
			return this;
		};

		this.update = function(_frameCount, color) {
			var seconds = Math.floor(_frameCount / 60);
			var dec = Math.floor(_frameCount - (seconds * 60));
			dec = ('0' + dec).slice(-2);
			this.timeText.innerHTML = seconds + ':' + dec;

			var percent = (_frameCount / (this.levelTimings[this.currentLevel] * 60)) * 100;
			if (this.currentLevel > 0 && this.currentLevel < this.levelTexts.length - 1)
				percent = ((_frameCount - (this.levelTimings[this.currentLevel - 1] * 60)) / ((this.levelTimings[this.currentLevel] * 60) - (this.levelTimings[this.currentLevel - 1] * 60))) * 100;
			if (this.currentLevel == this.levelTexts.length - 1)
				percent = 100;
			percent %= 101;
			this.levelProgress.style.width = percent + '%';
			this.levelProgress.style.backgroundColor = color;

			for (var i = 0; i < this.levelTimings.length; i++) {
				if (seconds == this.levelTimings[i] && this.currentLevel == i) {
					if (i < this.levelTimings.length - 1 && this.notify != null)
						this.notify.play();
					this.currentLevel++;
					this.levelText.innerHTML = this.levelTexts[this.currentLevel];
				}
			};
		};
	};

	return Timer;
}());

});

require.register("src/Utils", function(exports, require, module) {
"use strict";

var Utils = {
	interpolateColor: function interpolateColor(minColor, maxColor, maxDepth, depth) {
		function d2h(d) {return d.toString(16);}
		function h2d(h) {return parseInt(h,16);}

		if (depth == 0)
			return minColor;
		if (depth == maxDepth)
			return maxColor;

		var color = "#";
		for (var i = 1; i <= 6; i += 2) {
			var minVal = new Number(h2d(minColor.substr(i,2)));
			var maxVal = new Number(h2d(maxColor.substr(i,2)));
			var nVal = minVal + (maxVal - minVal) * (depth / maxDepth);
			var val = d2h(Math.floor(nVal));
			while(val.length < 2){
				val = "0"+val;
			}
			color += val;
		};
		return color;
	},
	getJSON: function getJSON(url, callback) {
		var xhr = typeof XMLHttpRequest != 'undefined'
		? new XMLHttpRequest()
		: new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('get', url, true);
		xhr.onreadystatechange = function() {
			var status, data;
			if (xhr.readyState == 4) {
				status = xhr.status;
				if (status == 200) {
					data = JSON.parse(xhr.responseText);
					callback && callback(data);
				} else
					console.error("Error: " + status);
			}
		};
		xhr.send();
	},
	arrayAvg: function arrayAvg(a) {
		var sum = 0;
		for (var i = a.length - 1; i >= 0; i--) {
			sum += a[i];
		};
		return sum / a.length;
	}
};

module.exports = Utils;

});

require.register("src/Wall", function(exports, require, module) {
"use strict";

var Wall;

module.exports = Wall = (function() {
	function Wall(args) {
		this.walls = [false, false, false, false, false, false];
		this.distance = args.distance || 250;
		this.width = args.width || 50;

		var _patterns_ = [];
		if (typeof args !== 'undefined' && typeof args.patterns === 'object')
			_patterns_ = args.patterns;

		var _checkValid = function(walls) {
			for (var i = 0; i < walls.length; i++) {
				if (walls[i] == false)
					return true;
			}
			return false;
		};

		this.setPatterns = function(patterns) {
			_patterns_ = patterns;
		};

		this.generatePattern = function() {
			if (_patterns_.length > 0) {
				this.walls = _patterns_[Math.floor(Math.random() * _patterns_.length)];
				return;
			};

			for (var i = 0; i < this.walls.length; i++)
				this.walls[i] = Boolean(Math.round(Math.random()));
			if (!_checkValid(this.walls))
				this.generatePattern();
		};

		this.draw = function(canvas, color, offset) {
			var ctx = canvas.getContext('2d');
			var cx = canvas.width / 2,
			cy = canvas.height / 2;

			for (var i = 0; i < this.walls.length; i++) {
				if (!this.walls[i])
					continue;

				ctx.beginPath();
				ctx.moveTo(cx + (this.distance + offset) * Math.cos(i * 2 * Math.PI / 6), cy + (this.distance + offset) * Math.sin(i * 2 * Math.PI / 6));
				ctx.lineTo(cx + (this.distance + offset) * Math.cos((i + 1) * 2 * Math.PI / 6), cy + (this.distance + offset) * Math.sin((i + 1) * 2 * Math.PI / 6));
				ctx.lineTo(cx + ((this.distance + offset) - this.width) * Math.cos((i + 1) * 2 * Math.PI / 6), cy + ((this.distance + offset) - this.width) * Math.sin((i + 1) * 2 * Math.PI / 6));
				ctx.lineTo(cx + ((this.distance + offset) - this.width) * Math.cos(i * 2 * Math.PI / 6), cy + ((this.distance + offset) - this.width) * Math.sin(i * 2 * Math.PI / 6));
				ctx.closePath();

				ctx.fillStyle = color;
				ctx.strokeStyle = color;
				ctx.lineWidth = 1;
				ctx.fill();
				ctx.stroke();
			}
		};

		this.checkCollision = function(coord, canvas) {
			for (var i = 0; i < this.walls.length; i++) {
				var a_1 = i * (360 / 6),
				a_2 = (i + 1) * (360 / 6);
				if (!this.walls[i])
					continue;
				if (a_1 <= coord.a && a_2 >= coord.a) {
					if ((this.distance - this.width) <= coord.d &&
						this.distance >= coord.d)
						return true;
				}
			};

			return false;
		};
	};

	return Wall;
}());

});


//# sourceMappingURL=hexagon.js.map