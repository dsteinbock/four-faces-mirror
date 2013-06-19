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
      imgPixelData;

    p.setup = function () {

//      p.size(width, height);
      p.size(vWidth, vHeight);
      p.background(255);
      p.loadPixels();
      imgPixelData = p.pixels.toArray();
      p.frameRate(60);

      p.ellipseMode(p.CENTER);
      p.smooth();
            p.textFont(p.createFont("Arial",24));
    };


    // Override draw function, by default it will be called 60 times per second
    p.draw = function () {
      var img,
        newFill,
        j,
        i,
        val,
        cw,
        ch;

        cw = ctx.canvas.width;
        ch = ctx.canvas.height;
        p.background(0);
/*
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
*/

/*
      if (WEBCAM.localMediaStream) {
          p.pushMatrix();
        ctx.drawImage(WEBCAM.video, width/2, 0, width/2, height);
          p.translate(width, 0);
          p.scale(-1, 1);
        ctx.drawImage(WEBCAM.video, width/2, 0, width/2, height);               
          p.popMatrix();
      }
*/
      if (WEBCAM.localMediaStream) {
          p.pushMatrix();
/*
		  if( delayImages.length < 100) {
	          ctx.drawImage(WEBCAM.video, 0, 0, cw, ch);
	          // How to capture webcam video while displaying a different video? Need to draw to off-screen buffer and read from that. 
	            
	          p.fill(128);
	          p.noStroke();
	          p.rect(25, 25, 50, 50);
		  }
		  else {
		  	buf.drawImage(WEBCAM.video, 0, 0, cw, ch);
	          p.set( 0, 0, delayImages.shift());		  
		  }
*/
/* ! Draw webcam from buffer */
		  ctx.drawImage(WEBCAM.video, 0, 0, cw, ch);
		  delayImages.push(p.get(0,0,cw,ch));
		  if( delayImages.length > bufferSize) {
			  p.set( 0, 0, delayImages.shift());
		  }
          p.popMatrix();
      }
      else {
          p.stroke(255,255,255);
          var msg = "LOOK INTO THE CAMERA";
          var twidth = p.textWidth(msg);
          p.text(msg, (vWidth-twidth)/2, vHeight/2);
      }

          p.stroke(255,255,255);
/*           var msgL = "w = " + window.innerWidth + " h = " + window.innerHeight + " i = " + delayImages.length; */
			var msgL = "" + (bufferSize - delayImages.length);
          var msgR = "cw = " + ctx.canvas.width + " cw = " + ctx.canvas.height;
          var twidthL = p.textWidth(msgL);
          var twidthR = p.textWidth(msgR);
		if( delayImages.length < bufferSize) {
          p.text(msgL, (cw/2-twidthL)/2, ch-75);
          }
/*           p.text(msgR, (cw/2-twidthR)/2+cw/2, ch-75); */
          
          window.onresize = setCanvas;
            
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