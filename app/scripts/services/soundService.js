'use strict';

angular.module('jvdotcomApp')
  .service('Sound', function () {
	this.alert = function() {
		var audio = new Audio('app/sounds/chime.mp3');
		audio.play();
	};
});