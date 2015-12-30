"use strict";

var Timer;

module.exports = Timer = (function() {
	function Timer(args) {
		this.currentLevel = 0;
		this.levelTimings = [10, 20, 30, 45, 60];
		this.levelTexts = ["LINE", "TRIANGLE", "SQUARE", "PENTAGON", "HEXAGON"];
		this.element;
		this.timeText;
		this.label;
		this.level;
		this.levelText;
		this.levelProgressContainer;
		this.levelProgress;

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
			this.levelText.innerHTML = "POINT";
			this.level.appendChild(this.levelText);

			this.levelProgressContainer = document.createElement('div');
			this.level.appendChild(this.levelProgressContainer);

			this.levelProgress = document.createElement('div');
			this.levelProgress.style.backgroundColor = colors[1];
			this.levelProgressContainer.appendChild(this.levelProgress);
			return this;
		};

		this.update = function(_frameCount) {
			var seconds = Math.floor(_frameCount / 60);
			var dec = Math.floor(_frameCount - (seconds * 60));
			dec = ('0' + dec).slice(-2);
			this.timeText.innerHTML = seconds + ':' + dec;

			var percent = (_frameCount / (this.levelTimings[this.currentLevel] * 60)) * 100;
			if (this.currentLevel > 0)
				percent = ((_frameCount - (this.levelTimings[this.currentLevel - 1] * 60)) / ((this.levelTimings[this.currentLevel] * 60) - (this.levelTimings[this.currentLevel - 1] * 60))) * 100;
			percent %= 100;
			this.levelProgress.style.width = percent + '%';

			for (var i = 0; i < this.levelTimings.length; i++) {
				if (seconds == this.levelTimings[i] && this.currentLevel == i) {
					this.currentLevel++;
					this.levelText.innerHTML = this.levelTexts[i];
				}
			};
		};
	};

	return Timer;
}());
