/*global Processing: true, processing: true, WEBCAM: true, $: true */
/*jslint devel: true, browser: true, nomen: true, maxerr: 50, indent: 2 */

(function () {
	"use strict";
		// Simple way to attach js code to the canvas is by using a function
	function sketchProc(processing) {
		var p											= processing,
			ctx											= WEBCAM.ctx,
			buf											= WEBCAM.buf,
			width										= window.innerWidth,
			height									= window.innerHeight,
			vWidth									= 640,
			vHeight									= 480,
			delayImages							= new Array(),
			bufferSize							= 50,
			fontSize								= 20,
			doRecord								= false,
			mirrorVideo							= new Array(),
			mirrorVideoBuffer				= new Array(),
			mirrorDuration					= 100,
			imgPixelData,
			cw											= ctx.canvas.width,
			ch											= ctx.canvas.height;
		var MODE = { 
			START										: {name: "Start"},
			INTRO										: {name: "Intro"},
			RECORD									: {name: "Record"},
			PLAYBACK								: {name: "Playback"}
		},
			currentMode							= MODE.START;

		p.setup = function () {
			p.size(width, height);
/*			 p.size(vWidth, vHeight); */
//			imgPixelData = p.pixels.toArray();
			p.background(20,50,0);
			p.loadPixels();
			p.frameRate(60);
			p.smooth();
			p.noFill();
			p.noStroke();
			p.textFont(p.createFont("Arial",24));
			p.textSize(fontSize);
		};

		// Override draw function, by default it will be called 60 times per second
		p.draw = function () {
			// update canvas dimensions to latest window size
			cw = ctx.canvas.width;
			ch = ctx.canvas.height;
			p.pushMatrix();

			switch( currentMode ){
				case MODE.START: {
					drawInstructions();
					if(WEBCAM.localMediaStream)
						currentMode = MODE.INTRO;
					break;
				}
				case MODE.INTRO: {
					drawIntro();
					if(doRecord)
						currentMode = MODE.RECORD;
					break;
				}
				case MODE.RECORD: {
					if(doRecord)
						recordMirror();
					else
						currentMode = MODE.PLAYBACK;
					break;
				}
				case MODE.PLAYBACK: {
					playbackMirror();
					if(doRecord){
						resetMirror();
						currentMode = MODE.RECORD;
					}
					break;
				}
				default: { alert("Error: unknown mode!") }
			}
/*
			if (WEBCAM.localMediaStream) {
				ctx.drawImage(WEBCAM.video, 0, 0, cw, ch);
				if(doRecord){
					recordMirror();
				}
				else if(doPlayback) {
					
				}
			}
			else {
				drawInstructions();
			}
*/
			p.popMatrix();
			// draw guide lines
			drawGuidelines();
			// print debug info to screen
			drawDebug();									// BUG: doesn't display over delayed images
			
			window.onresize = setCanvas;
		};

		function printDebug(msg){
			var tw = p.textWidth(msg);
			p.text(msg, 10, ch-30);
		}
		
		/* detect key presses */
		p.keyPressed = function doKey(){
			doRecord = !doRecord;
		};

		/* Playback mirror video */
		function playbackMirror(){
			var currentFrame = mirrorVideo.shift();
			p.set( 0, 0, currentFrame);
			mirrorVideo.push(currentFrame);
		}

		function resetMirror(){
			mirrorVideo.length = 0;
		}
		
		/* Record mirror video */
		function recordMirror(){
			if( mirrorVideo.length < mirrorDuration ){
				ctx.drawImage(WEBCAM.video, 0, 0, cw, ch);		// draw frame from webcam
				mirrorVideo.push(p.get(0,0,cw,ch));					 // save it to the buffer
				p.fill(128,0,0);
				p.rect(0,0,cw,ch);														// hide it from the user
				printCenter("RECORDING");
				p.noFill();
			}
			else {
				doRecord = false;
			}
		}
		/* saves the current screen to buffer, then draws from buffer when it's full */
		function drawDelay(){
			delayImages.push(p.get(0,0,cw,ch));
			if( delayImages.length > bufferSize) {
				p.set( 0, 0, delayImages.shift());
			}
		}

		function drawGuidelines(){
			var padding = 40;
			
			// draw semi-transparent mask to frame the face
			p.noStroke();
			p.fill(0);
			ctx.globalAlpha = 0.6;
			p.rect(0,0,cw-padding,padding);
			p.rect(0,padding,padding,ch);
			p.rect(padding,ch-padding,cw,padding);
			p.rect(cw-padding,0,padding,ch-padding);
			ctx.globalAlpha = 1;

			//draw guide lines
			p.stroke(255,255,255);
			p.noFill();
//			p.rect(padding,padding,cw-padding*2,ch-padding*2);	// white frame on the mask
			p.line(cw/2, 10, cw/2, ch-10);	// vertical guideline
			var numLines = 10;
			for(var i=1; i<=numLines; i++){
				p.line(cw/5, ch/numLines * i, cw/5*4, ch/numLines * i);
			}
			p.noStroke();
		};

		function drawDebug(){
			p.fill(255);
			var msgL = "" + (bufferSize - mirrorVideo.length);
			var msgR = "cw = " + cw + " ch = " + ch;
			var twidthL = p.textWidth(msgL);
			var twidthR = p.textWidth(msgR);
			if( mirrorVideo.length < mirrorDuration) {
				p.text(msgL, 10, ch-10);
				p.text(msgR, (cw - twidthR - 10), ch-10);
			}
			p.noFill();
		};

		function drawIntro(){
			printCenter("Hit space to record");
		}

		function drawInstructions(){
			printCenter("Click here to begin");
		};

		function printCenter(msg){
			var twidth = p.textWidth(msg);
			p.fill(20);
			p.rect(cw/2-twidth/2-10,ch/2-fontSize/2-10-110,twidth+20,fontSize+20);
			p.fill(255);
			p.text(msg, (cw-twidth)/2, ch/2-100);			 
		}
		
		function setCanvas(){
			centerCanvas(document.getElementById('canvas1'));
			centerCanvas(document.getElementById('buffer'));
			document.getElementById('canvas1').focus();
		};
		
		function centerCanvas(canvasNode){
			var pw = canvasNode.parentNode.clientWidth;
			var ph = canvasNode.parentNode.clientHeight;
			
			canvasNode.height = pw * 0.8 * (canvasNode.height/canvasNode.width);	
			canvasNode.width = pw * 0.8;
			canvasNode.style.top = (ph-canvasNode.height)/2 + "px";
			canvasNode.style.left = (pw-canvasNode.width)/2 + "px"; 
		};
	}


	var canvas = document.getElementById("canvas1"),
		p = new Processing(canvas, sketchProc);
	// p.exit(); to detach it	 
}());