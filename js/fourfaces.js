/*global Processing: true, processing: true, WEBCAM: true, $: true */
/*jslint devel: true, browser: true, nomen: true, maxerr: 50, indent: 2 */

(function () {
  "use strict";
    // Simple way to attach js code to the canvas is by using a function
  function sketchProc(processing) {
    var p                     = processing,
      ctx                     = WEBCAM.ctx,
      buf                     = WEBCAM.buf,
      width                   = window.innerWidth,
      height                  = window.innerHeight,
      vWidth                  = 640,
      vHeight                 = 480,
      delayImages			  			= new Array(),
      bufferSize							= 50,
      fontSize								= 20,
      imgPixelData,
      cw											= ctx.canvas.width,
      ch 											= ctx.canvas.height;

    p.setup = function () {

      p.size(width, height);
/*       p.size(vWidth, vHeight); */
      p.background(20,50,0);
      p.loadPixels();
//      imgPixelData = p.pixels.toArray();
      p.frameRate(60);
      p.smooth();
      p.noFill();
    	p.noStroke();
			p.textFont(p.createFont("Arial",24));
			p.textSize(fontSize);
    };

    // Override draw function, by default it will be called 60 times per second
    p.draw = function () {
			// update canvas dimensions
      cw = ctx.canvas.width;
      ch = ctx.canvas.height;
			p.pushMatrix();
//        ctx.canvas.width  = window.innerWidth;
//        ctx.canvas.height = window.innerHeight;

/* ! Draw webcam from buffer  */
      if (WEBCAM.localMediaStream) {
			  ctx.drawImage(WEBCAM.video, 0, 0, cw, ch);
// 			  drawDelay();

      }
      else {
				drawInstructions();
      }
      p.popMatrix();
      // draw guide lines
      drawGuidelines();
			// print debug info to screen
			drawDebug();									// BUG: doesn't display over delayed images

      window.onresize = setCanvas;            
    };

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
//    	p.rect(padding,padding,cw-padding*2,ch-padding*2);	// white frame on the mask
	    p.line(cw/2, 10, cw/2, ch-10);	// vertical guideline
			var numLines = 10;
			for(var i=1; i<=numLines; i++){
				p.line(cw/5, ch/numLines * i, cw/5*4, ch/numLines * i);
			}
    	p.noStroke();
    };

		function drawDebug(){
    	p.fill(255);
			var msgL = "" + (bufferSize - delayImages.length);
      var msgR = "cw = " + cw + " ch = " + ch;
      var twidthL = p.textWidth(msgL);
      var twidthR = p.textWidth(msgR);
			if( delayImages.length < bufferSize) {
        p.text(msgL, 10, ch-10);
				p.text(msgR, (cw - twidthR - 10), ch-10);
      }
      p.noFill();
		};

		function drawInstructions(){
      var msg = "LOOK INTO THE CAMERA";
      var twidth = p.textWidth(msg);
			p.fill(20);
			p.rect(cw/2-twidth/2-10,ch/2-fontSize/2-10-110,twidth+20,fontSize+20);
			p.fill(255);
      p.text(msg, (cw-twidth)/2, ch/2-100);
		};
    
    function setCanvas(){
   		centerCanvas(document.getElementById('canvas1'));
			centerCanvas(document.getElementById('buffer'));
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