# Four Faces Mirror
## v0.5 - True Mirror (first public release)

### What is it?

Here is a face you know better than any other, and yet you've never seen this face before. This is a software-based *true mirror*. Unlike a regular mirror (and most webcam programs), this one doesn't flip your image backwards. It shows the 'true you' that everyone else in the world sees. It may look strange because you're used to the 'backwards you' seen in ordinary mirrors all your life. 

### Requirements

Works in the Chrome web browser (v. 27 as of this writing). May work in other up-to-date browsers that support HTML5 & getUserMedia; I have not tested browsers other than Chrome.

The software is written in pure javascript, employing getUserMedia for webcam access, HTML5 canvas for display, and Processing.js for image manipulation.

### Live Demo

Live demo version at http://fourfaces.org. (Warning: under active development and may be broken at any given time!)

### How to use

1. Grant permission for the webcam to be used.
2. Click the app to begin.
3. Center and align your face with the guidelines. Look directly in the camera and don't look away.
4. When you're ready, hit SPACE to record.
5. Recording commences and finishes automatically.
6. Now you're in True Mirror mode. Activate splitting to compare the sides of the face.

### Keyboard commands in True Mirror mode:

		h 				  = toggle help display
		SPACE 		  = re-record video
		LEFT/RIGHT  = split the mirror
		z/x 			  = adjust the split
		s 				  = toggle split on/off