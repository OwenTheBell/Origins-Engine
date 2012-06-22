var Sprite = klass(function (left, top, image, id) {
	this.containerScreen;
	this.top = top; //y
	this.left = left; //x
	this.image = new Image();
	this.image.src = image;
	this.id = id;
	this.drawState = 'new';
	/*
	 * Make the div that will contain the image and positional data
	 */
	this.repDiv = jQuery('<div>', {
		id: this.id
	});
	this.repDiv.html("<img src='" + this.image.src + "' />");
	this.repDiv.css({
		position: 'inherit',
		top: this.top + 'px',
		left: this.left + 'px',
	});
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
			//debugPrint(this.width, this.height);
			if (this.drawState === 'new') {
				if (!this.containerScreen) {
					console.log("ERROR: new sprite " + this.id + " is not in a screen");
				} else {
					$('#' + this.containerScreen.id).append(this.repDiv);
				}
			} else if (this.drawState === 'updated'){
				/*
				 * Since the div containing the image has already been added to the
				 * DOM, all that needs to be updated is the css to alter its position
				 */
				this.repDiv.css({
					top: this.top + 'px',
					left: this.left + 'px'
				});
				//console.log("drawing sprite: " + this.id); 
			} else if (this.drawState === 'removed') {
				//remove from the DOM
				$('#' + this.id).remove();
				//still needs to be removed from the spriteArray in the screen
			} else if (this.drawState === 'unchanged') { //no need to do anything, duh
			} else {
				console.log("ERROR: invalid sprite draw state: " + this.id);
			}
			this.drawState = 'unchanged';
		}
	});

var clickSprite = Sprite.extend(function(top, left, image, id){
	this.mouseLoc = null;
	this.clickMap = [];
	//this.repDiv.addClass('clickSprite');
})
	.methods({
		clicked: function(x, y){
			this.mouseLoc = {X:x, Y:y};
		},
		update: function(){
			this.supr();
			
			if (this.clickMap.length == 0){
				this.makeClickMap();
			}
			
	
			//Sprite has been clicked on, check if pixel is transparent or not
			if (this.mouseLoc){
				console.log(this.id + ' check click');
				helper.debugPrint(this.mouseLoc.X, this.mouseLoc.Y);
				//The click map starts at (0, 0) relative to the sprite so the mouse position
				//needs to be adjusted to account for the position of the sprite as well as
				//the game div
				var x = this.mouseLoc.X - this.left - parseInt($('#origins').css('left'));
				var y = this.mouseLoc.Y - this.top - parseInt($('#origins').css('top'));
				//helper.debugPrint(x, y);
				if (this.clickMap[x][y] == 1){
					console.log(this.id + ' clicked');
					this.onClick();
					//debugPrint(x, y);
				}
				this.mouseLoc = null;
			}
		},
		onClick: function(){
			var randomnumber =  Math.floor(Math.random() * parseInt($('#origins').css('width')));
			this.changeLeft(randomnumber);
			randomnumber = Math.floor(Math.random() * parseInt($('#origins').css('top')));
			this.changeTop(randomnumber);
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
		}
	})
