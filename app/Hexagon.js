"use strict";

var Utils 			= require('Utils');
var RegularPolygon 	= require('RegularPolygon');
var Rays 			= require('Rays');
var Wall 			= require('Wall');
var Cursor 			= require('Cursor');
var Timer 			= require('Timer');

var Hexagon;

module.exports = Hexagon = (function() {
	function Hexagon(args) {
		if (typeof args === 'undefined')
			throw new Error("No args provided");
		if (typeof args.canvas === 'undefined')
			throw new Error("No canvas provided");

		this.args = args;

		this.canvas = args.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.angleSpeed = typeof args.angleSpeed === 'number' ? args.angleSpeed : 2;
		this.walls = [null, null, null, null];
		this.wallColors = args.wallColors || ["#1EAAA5", "#4EFC96"];
		this.currentWallColor = this.wallColors[0];
		this.backgroundColors = args.backgroundColors || ["#0A2727", "#103D3D"];
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
			strokeColor: "rgba(0,0,0,0)",
			strokeWidth: 1,
			radius: 75,
			speed: args.cursorSpeed || 5
		});
		this.wallSpeed = args.wallSpeed || 2;
		this.minDist = Math.sqrt(
			Math.pow(this.canvas.width, 2) +
			Math.pow(this.canvas.height, 2)
			) / 2;
		this.timer = new Timer().init(this.wallColors);

		var _animation_id_;
		var _frameCount = 0;
		var _isDead = false;
		var COLOR_DARK = 0, COLOR_LIGHT = 1;

		for (var i = 0; i < this.walls.length; i++) {
			this.walls[i] = new Wall({
				distance: this.minDist + ((this.minDist / 3) * (i + 1))
			});
			console.log(this.walls[i]);
			this.walls[i].generatePattern(6);
		};

		this.init = function() {
			this.angleSpeed = typeof args.angleSpeed === 'number' ? args.angleSpeed : 2;
			if (Date.now() % 2 == 0)
				this.angleSpeed *= -1;
			this.wallSpeed = args.wallSpeed || 2;
			this.cursor.size = 7;
			this.timer.currentLevel = 0;
			this.timer.levelText.innerHTML = "POINT";
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
			this.hexagon.draw(this.canvas, this.backgroundColors[COLOR_DARK], this.currentWallColor, 7);
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

			if ((Math.floor(Math.random() * 1000)) < 1)
				this.angleSpeed *= -1;

			this.ctx.fillStyle = this.backgroundColors[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.backgroundColors[COLOR_DARK], this.backgroundColors[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern(6);
				}
				if (this.walls[i].checkCollision(this.cursor.getCoord(), this.canvas))
					_isDead = true;
			}
			this.cursor.color = this.currentWallColor;
			this.cursor.draw();
			if (this.cursor.radius > 75)
				this.cursor.radius -= 25;
			if (this.cursor.size > 7)
				this.cursor.size -= 1;
			this.hexagon.draw(this.backgroundColors[COLOR_DARK], this.currentWallColor, 7);
			if (this.hexagon.size > 50)
				this.hexagon.size -= 25;
			this.timer.update(_frameCount);

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
							_this.walls[i].generatePattern(6);
						};
						window.onkeydown = null;
						cancelAnimationFrame(_animation_id_);
						_this.init().play();
						return;
					};
				};
			}

			this.ctx.fillStyle = this.backgroundColors[COLOR_DARK];
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.rotate(this.angleSpeed * Math.PI / 180);
			this.ctx.translate(- this.canvas.width / 2, - this.canvas.height / 2);
			this.rays.draw(this.canvas, [this.backgroundColors[COLOR_DARK], this.backgroundColors[COLOR_LIGHT]]);
			for (var i = 0; i < this.walls.length; i++) {
				this.walls[i].draw(this.canvas, this.currentWallColor);
				this.walls[i].distance -= this.wallSpeed;
				if (this.walls[i].distance <= 0) {
					this.walls[i].distance = this.minDist + (this.minDist / 3);
					this.walls[i].generatePattern(6);
				}
			}
			this.cursor.color = _frameCount % 6 < 3 ? this.wallColors[0] : this.wallColors[1];
			this.cursor.draw();
			this.hexagon.draw(this.backgroundColors[COLOR_DARK], this.currentWallColor, 7);

			_frameCount++;
			_animation_id_ = requestAnimationFrame(_dead.bind(this));
		};

		return this;
	};

	return Hexagon;
}());
