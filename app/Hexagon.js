"use strict";

var Utils 			= require('src/Utils');
var RegularPolygon 	= require('src/RegularPolygon');
var Rays 			= require('src/Rays');
var Wall 			= require('src/Wall');
var Cursor 			= require('src/Cursor');
var Timer 			= require('src/Timer');

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
		this.backgroundColors = [["#0A2727", "#103D3D"], ["#092415", "#0D2F1C"]];
		this.wallColors = ["#1EAAA5", "#4EFC96"];
		this.wallSpeed = 5;
		
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

		this.loadConfig = function(url, callback) {
			var _this = this;
			var data = Utils.getJSON(url, function(data) {
				if (typeof data === 'undefined') {
					console.error("HexagonJS @ " + url + ": Can't get data.");
					return;
				}
				if (typeof data.game === 'undefined') {
					console.error("HexagonJS @ " + url + ": \"game\" object not found.");
					return;
				}
				if (!this.audio_bgm && typeof data.game.music !== 'undefined') {
					if (typeof data.game.music === 'string') {
						this.audio_bgm = new Audio(data.game.music);
						this.audio_bgm.volume = 0.6;
						_audio_src_ = _audio_ctx_.createMediaElementSource(this.audio_bgm);
						_audio_src_.connect(_analyser_);
						_audio_src_.connect(_audio_ctx_.destination);
						_audio_data_ = new Uint8Array(_analyser_.frequencyBinCount);		
						_chunk_size_ = ~~(_audio_data_.length / 3);
					} else
						console.error("HexagonJS @ " + url + ": \"music\" must be a string.");
				}
				if (typeof data.game.angleSpeed !== 'undefined') {
					if (typeof data.game.angleSpeed === 'number')
						this.angleSpeed = data.game.angleSpeed;
					else
						console.error("HexagonJS @ " + url + ": \"angleSpeed\" must be a number.");
				}
				if (typeof data.game.wallSpeed !== 'undefined') {
					if (typeof data.game.wallSpeed === 'number')
						if (data.game.wallSpeed > 0)
							this.wallSpeed = data.game.wallSpeed;
						else
							console.error("HexagonJS @ " + url + ": \"wallSpeed\" must be a not null positive number.");
					else
						console.error("HexagonJS @ " + url + ": \"wallSpeed\" must be a number.");
				}
				if (typeof data.game.cursorSpeed !== 'undefined') {
					if (typeof data.game.cursorSpeed === 'number')
						if (data.game.cursorSpeed > 0)
							this.cursor.speed = data.game.cursorSpeed;
						else
							console.error("HexagonJS @ " + url + ": \"cursorSpeed\" must be a not null positive number.");
					else
						console.error("HexagonJS @ " + url + ": \"cursorSpeed\" must be a number.");
				}
				if (typeof data.game.backgroundColors !== 'undefined') {
					if (typeof data.game.backgroundColors === 'object')
						if (data.game.backgroundColors.length == 2) {
							if (typeof data.game.backgroundColors[0] === 'object' &&
								typeof data.game.backgroundColors[1] === 'object')
								if (data.game.backgroundColors[0].length != 2 ||
									data.game.backgroundColors[1].length != 2 ||
									typeof data.game.backgroundColors[0][0] !== 'string' ||
									typeof data.game.backgroundColors[0][1] !== 'string' ||
									typeof data.game.backgroundColors[1][0] !== 'string' ||
									typeof data.game.backgroundColors[1][1] !== 'string')
									console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain two arrays containing two strings.");
								else
									this.backgroundColors = data.game.backgroundColors;
							else
								console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain arrays of strings.");
						}
						else
							console.error("HexagonJS @ " + url + ": \"backgroundColors\" must contain two values.");
					else
						console.error("HexagonJS @ " + url + ": \"backgroundColors\" must be an array of arrays of strings.");
				}
				if (typeof data.game.wallColors !== 'undefined') {
					if (typeof data.game.wallColors === 'object')
						if (data.game.wallColors.length == 2) {
							if (typeof data.game.wallColors[0] === 'string' &&
								typeof data.game.wallColors[1] === 'string')
								this.wallColors = data.game.wallColors;
							else
								console.error("HexagonJS @ " + url + ": \"wallColors\" must contain strings.");
						}
						else
							console.error("HexagonJS @ " + url + ": \"wallColors\" must contain two values.");
					else
						console.error("HexagonJS @ " + url + ": \"wallColors\" must be an array of strings.");
				}
				if (typeof data.game.patterns === 'object') {
					for (var i = 0; i < data.game.patterns.length; i++) {
						if (typeof data.game.patterns[i] != 'object' ||
							data.game.patterns[i].length != 6) {
							console.error("HexagonJS @ " + url + ": \"patterns\" must be an array of arrays of 6 booleans.");
						}
					}
					for (var i = this.walls.length - 1; i >= 0; i--) {
						this.walls[i].setPatterns(data.game.patterns);
						this.walls[i].generatePattern();
					};
				}

				if (typeof data.levels !== 'undefined')
					this.timer.load(data);

				if (typeof callback === 'function')
					callback();
			}.bind(this));
		};

		if (typeof this.args.config === 'string')
			this.loadConfig(this.args.config);

		this.init = function() {
			if (typeof this.args.config === 'string')
				this.loadConfig(this.args.config, function() {
					if (Math.floor(Date.now()) % 2 == 0)
						this.angleSpeed *= -1;
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
					this.audio_bgm.currentTime = 0;
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
			var _fc_acc = (_frameCount % 120) <= 60 ? (_frameCount % 120) : 60 - ((_frameCount % 120) - 60);
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

			if ((_frameCount % (5* 60) == 0) && (Math.floor(Math.random() * 100)) < 5)
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
