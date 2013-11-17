/*global Processing: true, processing: true, WEBCAM: true, $: true */
/*jslint devel: true, browser: true, nomen: true, maxerr: 50, indent: 2 */


(function () {
	"use strict";
		// Simple way to attach js code to the canvas is by using a function
	function sketchProc(processing) {
		var p											= processing,
			ctx											= WEBCAM.ctx,
			buf											= WEBCAM.buf,
			js											= window,
			width										= window.innerWidth,
			height									= window.innerHeight,
			initWidth								= 640,
			initHeight							= 480,
			delayImages							= new Array(),
			bufferSize							= 50,
			fontSize								= 20,
			centerline							= 0,
			mirrorVideo							= new Array(),
			mirrorVideoLoop,
			currentFrameIndex 			= 0,
			mirrorDuration					= 90,
			imgPixelData,
			cw											= ctx.canvas.width,
			ch											= ctx.canvas.height;
		var MODE = { 
			WEBCAM									: {name: "Webcam"},
			START										: {name: "Start"},
			INTRO										: {name: "Intro"},
			RECORD									: {name: "Record"},
			PLAYBACK								: {name: "Playback"},
			QUESTIONS								: {name: "Questions"}
		},
			initJSNeeded							= true,
			doStart									= true,
			doSplit									= true,
			doRecord								= false,
			doQuestions							= false,
			doAnswers								= false,
			doDebug									= false,
			doInitializeInterview		= true,
			showHelp								= false,
			showLeft								= true,
			currentMode							= MODE.WEBCAM;
		var KEY = { 
			RECORD_TOGGLE						: {value: '32', key: 'space'},
			HELP_TOGGLE							: {value: '104', key: 'h'},
			SHIFT_LEFT							: {value: '122', key: 'z'},
			SHIFT_RIGHT							: {value: '120', key: 'x'},
			SPLIT_TOGGLE					  : {value: '115', key: 's'},
			SPLIT_LEFT						  : {value: p.LEFT, key: 'left'},
			SPLIT_RIGHT						  : {value: p.RIGHT, key: 'right'},
			ENTER									  : {value: p.ENTER, key: 'enter'},
			RETURN								  : {value: p.RETURN, key: 'return'},
		};
		var interviewAnswers,
				interviewQuestions,
				currentQuestion				= 0,
				wordList 				= [ "masculine",
														"young",
														"cautious",
														"wise",
														"practical",
														"spiritual",
														"funny",
														"happy",
														"risk-taking",
														"romantic" ];

		p.setup = function () {
			p.size(initWidth, initHeight);
//			imgPixelData = p.pixels.toArray();
			p.background(20,50,0);
			p.loadPixels();
			p.frameRate(15);		// will need to detect user's native webcam FPS somehow? Mine is 15, I think.
			p.smooth();
			p.noFill();
			p.noStroke();
			p.textFont(p.createFont("Arial",24));
			p.textSize(fontSize);
			setCanvas();
		};

		function initJS() {
			if( initJSNeeded ){
				js.doRecord = function () { doRecord = true; canvas.focus(); };
				js.startWebcam = function () {
					WEBCAM.startWebcam();
					$('.orbit-next span').trigger('click');  // move the Orbit instructions forward};
				}
				// Fill in triggers for state-change events: js.doMirror, etc. 
				initJSNeeded = false;
			}
		}
		
		// Override draw function, by default it will be called 60 times per second
		p.draw = function () {
			// update canvas dimensions to latest window size
			cw = ctx.canvas.width;
			ch = ctx.canvas.height;
			p.pushMatrix();

			initJS();
			switch( currentMode ){
				case MODE.WEBCAM: {
/* 					drawRequirements(); */
					if(WEBCAM.localMediaStream){
						$('.orbit-next span').trigger('click');  // move the Orbit instructions forward
						currentMode = MODE.START;
					}
					break;
				}
				case MODE.START: {
					drawGuidelines();
/* 					drawStartButton(); */
					if(doStart)
						currentMode = MODE.INTRO;
					break;
				}
				case MODE.INTRO: {
					drawPreview();
					drawGuidelines();
/* 					drawInstructions(); */
					initCenterline();
					initInterviewQuestions();
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
					splitMirror();		// split by default
					drawHelp();
					if(doRecord){
						resetMirror();
						doRecord = !doRecord;
						currentMode = MODE.INTRO;
					}
					if(doQuestions)
						currentMode = MODE.QUESTIONS;
					break;
				}
				case MODE.QUESTIONS: {
					playbackMirror();
					splitMirror();		// split by default
					drawHelp();
					drawQuestion();
					if(doRecord){
						resetMirror();
						doRecord = !doRecord;
						currentMode = MODE.INTRO;
					}
					if(doAnswers)
						currentMode = MODE.ANSWERS;
					break;
				}
				case MODE.ANSWERS: {
					drawAnswers();
					break;
				}
				default: { alert("Error: unknown mode!") }
			}

			p.popMatrix();
			// print debug info to screen
/* 			drawDebug();									// BUG: doesn't display over delayed images */
			
			window.onresize = setCanvas;
		};

		function printDebug(msg){
			p.fill(255);
			var tw = p.textWidth(msg);
			p.text(msg, 10, ch-30);
			p.noFill();
		}
		
		function initCenterline(){
			if(centerline == 0){
				centerline	= Math.floor(cw / 2);
			}
		}
		/* FUNCTION: doKey(): detect key presses and do something 
			s = 115, S = 83, a = 97, A = 65, z = 122, Z = 90, space = 32, arrows are coded
		*/
		p.keyPressed = function doKey(){
			if(doDebug) console.log("Key: " + p.str(p.key) + " " + p.key + ", KeyCode: " + p.keyCode);
			if( p.key == p.CODED ){
				switch( p.keyCode ){
					case KEY.SPLIT_LEFT.value: {
						doSplit = true;
						showLeft = true;
						break;
					}
					case KEY.SPLIT_RIGHT.value: {
						doSplit = true;
						showLeft = false;
						break;
					}
					default: break;
				}
			}
			else {
				switch( "" + p.key ){			// convert to string
					case KEY.RECORD_TOGGLE.value: {
						doRecord = !doRecord;
						break;
					}
					case KEY.HELP_TOGGLE.value: {
						showHelp = !showHelp;
						break;
					}
					case KEY.SPLIT_TOGGLE.value: {
						doSplit = !doSplit;
						break;
					}
					case KEY.SHIFT_LEFT.value: {
						centerline--;
						break;
					}
					case KEY.SHIFT_RIGHT.value: {										// x
						centerline++;
						break;
					}
					case KEY.ENTER.value:
					case KEY.RETURN.value: 
					case "10": {
						doQuestions = true;
						if( currentMode == MODE.QUESTIONS ){		// Submit answer to the question
							var answer = showLeft ? 0 : 1;				// left side visible = 0, right side = 1
							interviewAnswers.push( answer );
							currentQuestion++;
							if( currentQuestion == interviewQuestions.length )
								doAnswers = true;
						}
						break;
					}
					default: break;
				}				
			}
		};
		
		p.mouseClicked = function doMouse(){
			doStart = true;
		}

		/* Playback mirror video */
		function playbackMirror(){
			if(currentFrameIndex < mirrorVideoLoop.length) {
				var currentFrame = mirrorVideoLoop[currentFrameIndex];
				p.set( 0, 0, currentFrame);
				currentFrameIndex++;
			}
			else {
				currentFrameIndex = 0;
			}
		}
		
		/* Display interview questions to the user */
		function drawQuestion() {
			var msg, tw;

			p.fill(255);
			msg = interviewQuestions[currentQuestion];
			tw = p.textWidth(msg);
			p.text(msg, (cw-tw)/2, ch-30);			 
			p.noFill();
		}
		/* Display summary of interview */
		function drawAnswers() {
			// not implemented yet
			doQuestions = false;
			doAnswers = false;
			printCenter("ANSWERS!!!!!!!!");
			currentMode = MODE.PLAYBACK;
		}

		/* FUNCTION: toggle display of keyboard controls */
		function drawHelp(){
			var msg, tw;
			
			if(showHelp){
				p.fill(255);
				msg = "h = help   SPACE = re-record   LEFT/RIGHT = split   z/x = fine-tune the split";
				tw = p.textWidth(msg);
			}
			else {
				p.fill(255);
				msg = "h = help";
				tw = p.textWidth(msg);
			}
			p.text(msg, 10, 30);
			p.noFill();
		}

		/* FUNCTION splitMirror: show only half the image at a time */
		function splitMirror(){
			p.fill(0);
			if(showLeft)
				p.rect(centerline, 0, cw - centerline, ch);
			else
				p.rect(0, 0, centerline, ch);
			p.noFill();
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
				buildLoopVideo();
				doRecord = false;
			}
		}
		
		function buildLoopVideo(){
			mirrorVideoLoop = mirrorVideo.slice();
			mirrorVideo.pop();
			mirrorVideoLoop = mirrorVideoLoop.concat( mirrorVideo.reverse());
			mirrorVideoLoop.pop();
			if(doDebug) console.log("mirror = " + mirrorVideo.length + ", loop = " + mirrorVideoLoop.length);
		}
		
		function drawPreview(){
			ctx.drawImage(WEBCAM.video, 0, 0, cw, ch);		// draw frame from webcam
			var img = p.get(0,0,cw,ch);
			p.pushMatrix();
			p.scale(-1.0, 1.0);
			p.set( -(img.width), 0, img);
 			p.popMatrix();
		}
		
		/* saves the current screen to buffer, then draws from buffer when it's full */
/*
		function drawDelay(){
			delayImages.push(p.get(0,0,cw,ch));
			if( delayImages.length > bufferSize) {
				p.set( 0, 0, delayImages.shift());
			}
		}
*/

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
			var msgL = "" + (mirrorDuration - mirrorVideo.length);
			var msgR = "cw = " + cw + " ch = " + ch;
			var twidthL = p.textWidth(msgL);
			var twidthR = p.textWidth(msgR);
			if( mirrorVideo.length < mirrorDuration) {
				p.text(msgL, 10, ch-10);
				p.text(msgR, (cw - twidthR - 10), ch-10);
			}
			p.noFill();
		};

		function drawRequirements(){
			printCenter("Requires the Chrome browser. Click 'Allow' above to activate webcam.");
		};

		function drawStartButton(){
			printCenter("Make your browser window large, then click here to begin.");
		};

		function drawInstructions(){
			printCenter("Center your face. Relax, look right into the camera, and hit space to record. Don't look away.");
		};


		function printCenter(msg){
			var twidth = p.textWidth(msg);
			p.fill(20);
/* 			p.rect(cw/2-twidth/2-10,ch/2-fontSize/2-10-110,twidth+20,fontSize+20); */
/* 			p.rect(100,ch/2-fontSize/2-10-110,cw-200,fontSize+20); */
			p.rect(0,ch/2-fontSize/2-10-110,cw-1,fontSize+20);
			p.fill(255);
			p.text(msg, (cw-twidth)/2, ch/2-100);			 
		}
		
		function setCanvas(){
			centerCanvas(document.getElementById('canvas1'));
/* 			centerCanvas(document.getElementById('buffer')); */
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
		
		function initInterviewQuestions() {
			if( doInitializeInterview ){
				doInitializeInterview = false;
				var prefix = "Which side is more ";
				interviewAnswers 		= new Array(),
				interviewQuestions	= new Array();
				
				for(var i=0; i<wordList.length; ++i){
					interviewQuestions.push( prefix + wordList[i] + "?");
					if(doDebug) console.log("pushing " + interviewQuestions[i]);
				}
			}
		}
		
		p.mouseMoved = function() {
	    p.line(p.mouseX,0,p.mouseX,height);
	    p.line(0,p.mouseY,width,p.mouseY);
	    p.redraw();
	    if(js!=null){
      	js.showXYCoordinates(p.mouseX, p.mouseY);
			}
		}
		
		function doShit() {
			alert("Doing shit.");
		}
	}

	var canvas = document.getElementById("canvas1");
	var p      = new Processing(canvas, sketchProc);
	// p.exit(); to detach it	 
}());