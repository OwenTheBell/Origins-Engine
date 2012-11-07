var Mod1Exp3Screen = Screen.extend(function(id){
  this.setup = false;
	this.processValue = 60;
  this.elements = [];
  this.imageCanvas = new Canvas('skyMapCanvas', 0, 0, 1280, 640, 3);
  this.entry = new textBox('entry', '', 0, 660, '#000000', 3, '20px');
  this.collectedInput = '';
  this.entry = new numInputBox('entry', 0, 660, 500, 50, 3);
  this.elements.push(this.imageCanvas, this.entry);
  this.outputImage = document.createElement('canvas');
  this.throttle = 10000; //num of pixels to calculate per frame
  this.tracker = 0; //num of pixels that have been covered
})
  .methods({
    setupTime: function(){
      this.setup = true;
      this.skyMap = this.spriteArray['skyMap'];
      delete this.spriteArray[this.skyMap.id];
    },
    update: function(){
      if (!this.setup) this.setupTime();
      else {
        for (x in this.elements){
          this.elements[x].update();
        }
				if (this.entry.acceptedInput != '') {
					if (this.processValue != parseInt(this.entry.acceptedInput)){
						console.log('boo!!!!');
						this.processValue = parseInt(this.entry.acceptedInput);
						this.tracker = 0;
					}
					this.entry.acceptedInput = '';
				}
				this.convertOutput(this.processValue);
      }
      this.supr();
    },
    draw: function(HTML){
       if (this.css['opacity'] > 0){
        HTML.push('<div id=', this.id, ' style="');
        for(x in this.css){
          HTML.push(x, ': ', this.css[x], '; ');
        }
        if (this.classes.length > 0){
          HTML.push('" class="');
          for(x in this.classes){
            HTML.push(this.classes[x], ' ');
          }
        }
        HTML.push('" >');
        for (x in this.spriteArray){
          this.spriteArray[x].draw(HTML);
        }
        for (x in this.elements){
          this.elements[x].draw(HTML);
        }
        HTML.push('</div>');
      }
    },
    canvasDraw: function(){
      if (this.css['opacity'] > 0){
        var fragment = document.createDocumentFragment();
        var div = document.getElementById(this.id);
        this.imageCanvas.clear();
        this.imageCanvas.context.drawImage(this.outputImage, 0, 0);
        fragment.appendChild(this.imageCanvas.canvasDraw());
        div.appendChild(fragment);
      }
    },
    convertOutput: function(input){
      var starting = this.tracker;
      var factor = Math.pow(Math.E, input-60);
      var canvas = this.outputImage;
      if (canvas.width === 300){
        canvas.width = this.skyMap.width;
        canvas.height = this.skyMap.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.skyMap.image, 0, 0);
      }
      var ctx = this.outputImage.getContext('2d');
      var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (this.tracker*4 < pixels.data.length){
        var limit = starting + this.throttle;
        for (var x = starting; x < limit; x++){
          this.tracker = x;
          var i = x*4;
          if(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2] != 0){
            for (var j=0; j<3; j++){
              pixels.data[i+j] = factor * pixels.data[i+j];
            }
          }
        }
      } else {
				console.log("done!");
			}
      ctx.putImageData(pixels, 0, 0);
    }
  });
