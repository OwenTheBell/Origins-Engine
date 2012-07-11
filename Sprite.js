var Sprite = klass(function (left, top, image, id) {
	this.parent;
	this.top = top; //y
	this.left = left; //x
	this.image = new Image();
	this.image.src = image;
	this.id = id;
	this.drawState = 'new';
	// this.cssClasses = []; //store names of any applied css classes
	
	this.css = {
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

var clickSprite = Sprite.extend(function(left, top, image, id){
	this.mouseLoc = null;
	this.clickMap = [];
	this.clicked = false;
	this.mouseOver = false; //detect mouse position over sprite
})
	.methods({
		update: function(){
			if (this.parent.activeScreen){
				if (this.clickMap.length == 0){
					this.makeClickMap();
				}
				
				if (this.clicked || this.mouseOver){
					var mouse = g.input.mouse;
					//Translate the mouse position so that it is relative to the sprite
					var x = mouse.X - this.left - parseInt($('#origins').css('left'));
					var y = mouse.Y - this.top - parseInt($('#origins').css('top'));
					
					if (this.clickMap[x][y] == 1){
						if(this.clicked){
							this.onClick();
						} else if (this.mouseOver){
							if (this.parent.classes.indexOf('cursor_pointer') == -1){
								console.log(this.id + ' is setting the cursor');
								this.parent.classes.push('cursor_pointer');
								this.css.cursor = 'pointer';
							}
						}
					} else if (this.parent.classes.indexOf('cursor_pointer') != -1){
						console.log(this.id + ' removing css cursor');
						var index = this.parent.classes.indexOf('cursor_pointer');
						this.parent.classes.splice(index, 1);
						delete this.css.cursor;
					}
					this.clicked = false;
					this.mouseOver = false;
				} else if (!this.mouseOver && this.parent.classes.indexOf('cursor_pointer') != -1){
					var index = this.parent.classes.indexOf('cursor_pointer');
					this.parent.classes.splice(index, 1);
				}
			}
		},
		onClick: function(){
		},
		makeClickMap: function(){
			//Using canvas create an 2d array of transparent vs nontransparent pixels
			var canvas = document.createElement('canvas');
			canvas.width = this.width();
			canvas.height = this.height();
			var ctx = canvas.getContext('2d');
			ctx.drawImage(this.image, 0, 0);
			
			var pixels = [];
			try {
				pixels = ctx.getImageData(0, 0, this.width(), this.height()).data;
			} catch (e){
				console.log('ERROR: ' + this.id + ' failed to load image');
			}
			
			for (var i = 0; i < pixels.length; i+=4){
				var col = Math.floor((i / 4) / this.width());
				var row = (i/4)	- (col * this.width());
				if(!this.clickMap[row]) this.clickMap[row] = [];
				this.clickMap[row][col] = pixels[i+3] == 0 ? 0 : 1;
			}
		}
	});

var screenChangeSprite = clickSprite.extend(function(left, top, image, id, targetScreen){
	this.targetScreen = targetScreen;
})
	.methods({
		onClick: function(){
			this.targetScreen.fadingIn(1);
			this.parent.fadingOut(1);
		}
	});
	
var dialogueSprite = clickSprite.extend(function(left, top, image, id, targetDialogue){
	this.targetDialogue = targetDialogue;
	this.targetDialogue.parent = this;
})
	.methods({
		onClick: function(){
			this.targetDialogue.activate();
			this.parent.activeScreen = false;
		},
		deActivated: function(){
			this.parent.activeScreen = true;
		},
		target: function(target){
			this.parent.getSprite(target).trigger();
		}
	});
/*
 * Sprite with the trigger method which causes some kind of action when called
 */
var triggerSprite = Sprite.extend(function(left, top, image, id){
})
	.methods({
		trigger: function(){
		}
	});

var moveSprite = triggerSprite.extend(function(left, top, image, id, x2, y2, frames){
	this.start = {X: left, Y: top}; //sprite starts at it's top and left coordinates
	this.moveTo = {X: x2, Y: y2}; //coordinates that the sprite will move to
	this.frames = frames;
	this.moveCount = 0;
	this.xMove;
	this.yMove;
	this.moving = false;
})
	.methods({
		trigger: function(){
			this.moving = true;
			this.moveCount = 0;
			this.yMove = (this.moveTo.Y - this.top) / this.frames;
			this.xMove = (this.moveTo.X - this.left) / this.frames;
		},
		update: function(){
			if (this.moving){
				if (this.moveCount < this.frames){
					this.top += this.yMove;
					this.left += this.xMove;
					this.moveCount++;
				} else {
					var temp = {X: this.moveTo.X, Y: this.moveTo.Y};
					this.moveTo = this.start;
					this.start = temp;
					this.moving = false;
					this.left = this.start.X;
					this.top = this.start.Y;
				}
			}
			
			this.css.top = this.top + 'px';
			this.css.left = this.left + 'px';
		}
	});

// var swapSprite = triggerSprite
