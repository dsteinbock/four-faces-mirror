/*global Drupal: true, jQuery: true, gigya: true */
/*jslint devel: true, browser: true, nomen: true, maxerr: 50, indent: 2 */

/**
 * A bunch of this was copied from here:
 * http://www.html5rocks.com/en/tutorials/getusermedia/intro/
 */

var WEBCAM = {
  init: function () {
    "use strict";

    function onWebcamFail() {
      alert('There are problems with the webcam stream.');
    }

    function hasGetUserMedia() {
      // Note: Opera builds are unprefixed.
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (!hasGetUserMedia()) {
      alert('Four Faces uses bleeding edge technology that is only available in the latest versions of Chrome, Firefox and Opera.');
    }

    var self = this,
      video  = document.querySelector('video'),
      canvas = document.getElementById('canvas1'),
      ctx    = canvas.getContext('2d'),
      captureTimer;

    self.video  = video;
    self.canvas = canvas;
    self.ctx    = canvas.getContext('2d');
    self.img    = document.querySelector('img');

    // Not showing vendor prefixes or code that works cross-browser.
    // Some cross-browser hints here: http://www.html5rocks.com/en/tutorials/getusermedia/intro/
		self.startWebcam = function () {
	    navigator.getUserMedia  = navigator.getUserMedia ||
			                          navigator.webkitGetUserMedia ||
																navigator.mozGetUserMedia ||
																navigator.msGetUserMedia;
	    if (navigator.getUserMedia) {
	      navigator.getUserMedia({video: true}, function (stream) {
	        self.video.src = window.URL.createObjectURL(stream);
	        self.localMediaStream = stream;
	      }, onWebcamFail);
	    } else if (navigator.webkitGetUserMedia) {
	      navigator.webkitGetUserMedia({video: true}, function (stream) {
	        self.video.src = window.webkitURL.createObjectURL(stream);
	        self.localMediaStream = stream;
	      }, onWebcamFail);
	    } else {
	      onWebcamFail();
	    }    
		}
  }
};

WEBCAM.init();