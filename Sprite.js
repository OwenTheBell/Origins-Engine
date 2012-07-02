var Sprite = klass(function (left, top, image, id) {
	this.containerScreen;
	this.top = top; //y
	this.left = left; //x
	this.image = new Image();
	this.image.src = image;
	this.id = id;
	this.drawState = 'new';
	// this.cssClasses = []; //store names of any applied css classes
	
	this.css = {
		// position: 'inherit',
		top: this.top + 'px',
		left: this.left + 'px',
	}
})
	.methods({
		changeTop: function(top){
			this.top = top;
			this.drawState = 'updated';
		},
		changeLeft: function(left){
			this.left = left;
			this.drawState = 'updated';
		},
		//these two functions just provide a little shorthand
		width: function(){
			return this.image.width;
		},
		height: function(){
			return this.image.height;
		},
		update: function(){
			this.css.top = this.top + 'px';
			this.css.left = this.left + 'px';
		},
		draw: function(){
			var HTML = '';
			HTML += '<div id="' + this.id +'" style="';
			for(x in this.css){
				HTML += x + ':' + this.css[x] + '; ';
			}
			HTML += '"><img src="' + this.image.src + '"/></div>';
			return(HTML);
		}
	});

var clickSprite = Sprite.extend(function(top, left, image, id){
	this.mouseLoc = null;
	this.clickMap = [];
	this.clicked = false;
	this.mouseOver = false; //detect mouse position over sprite
	//this.repDiv.addClass('clickSprite');
})
	.methods({
		update: function(){
			this.supr();
			
			if (this.clickMap.length == 0){
				this.makeClickMap();
			}
			
			if (this.clicked || this.mouseOver){
				var mouse = globalInput.mouse;
				//Translate the mouse position so that it is relative to the sprite
				var x = mouse.X - this.left - parseInt($('#origins').css('left'));
				var y = mouse.Y - this.top - parseInt($('#origins').css('top'));
				
				if (this.clickMap[x][y] == 1){
					if(this.clicked){
						this.onClick();
					}
					if (this.mouseOver){
						this.css.cursor = 'pointer';
					}
				} else if (this.css.cursor){
					delete this.css.cursor;
					console.log('reverting cursor');
				}
				this.clicked = false;
				this.mouseOver = false;
			} else if (!this.mouseOver && this.css.cursor){
				delete this.css.cursor;
				console.log('reverting cursor');
			}
		},
		onClick: function(){
		},
		makeClickMap: function(){
			//Using canvas create an 2d array of transparent vs nontransparent pixels
			//console.log("making a map");
			
			var canvas = document.createElement('canvas');
			canvas.width = this.width();
			canvas.height = this.height();
			var ctx = canvas.getContext('2d');
			ctx.drawImage(this.image, 0, 0);
			
			var pixels = [];
			// var that = this;
			try {
				pixels = ctx.getImageData(0, 0, this.width(), this.height()).data;
			} catch (e){
				console.log('ERROR: ' + this.id + ' failed to load image');
			}
			//these are declared out here to make debugging easier
			
			
			for (var i = 0; i < pixels.length; i+=4){
				var col = Math.floor((i / 4) / this.width());
				var row = (i/4)	- (col * this.width());
				if(!this.clickMap[row]) this.clickMap[row] = [];
				this.clickMap[row][col] = pixels[i+3] == 0 ? 0 : 1;
			}
		}
	});

var screenChangeSprite = clickSprite.extend(function(top, left, image, id, targetScreen){
	this.targetScreen = targetScreen;
})
	.methods({
		onClick: function(){
			this.targetScreen.fadingIn(1);
			this.containerScreen.fadingOut(1);
		}
	});
	
var dialogueSprite = clickSprite.extend(function(top, left, image, id, targetDialogue){
	this.targetDialogue = targetDialogue;
	this.targetDialogue.parent = this;
})
	.methods({
		onClick: function(){
			this.targetDialogue.activate();
			this.containerScreen.activeScreen = false;
		},
		deActivated: function(){
			this.containerScreen.activeScreen = true;
			console.log('Reseting active screen');
		}
	})
