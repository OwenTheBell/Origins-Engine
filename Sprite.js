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
		left: this.left + 'px'
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
					console.log("drawing new sprite: " + this.id);
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
	this.clicked = false;
	this.clickMap = [];
})
	.methods({
		update: function(){
			this.supr();
			
			
			if (this.clickMap.length == 0){
				this.makeClickMap();
			}
			
	
			//Sprite has been clicked on, check if pixel is transparent or not
			if (this.clicked){
				this.clicked = false;
				var mouseState = {X: inputState.mouseClick.X, Y: inputState.mouseClick.Y};
				//The click map starts at (0, 0) relative to the sprite so the mouse position
				//needs to be adjusted to account for the position of the sprite as well as
				//the game div
				var x = mouseState.X - this.left - parseInt($('#origins').css('left'));
				var y = mouseState.Y - this.top - parseInt($('#origins').css('top'));
				//both attributes have -1 applied to compensate for the slight offset of
				//cursor relative to clickable area. This solution is a hack and needs to be fixed
				if (this.clickMap[x-1][y-1] == 1){
					this.onClick();
					debugPrint(x, y);
				}
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
			
			var pixels = ctx.getImageData(0, 0, this.width(), this.height()).data;
			
			var i, row, col;
			
			for (i = 0, n = pixels.length; i < n; i+=4){
				row = Math.floor((i / 4) / this.width());
				col = (i/4)	- (row * this.width());
				if(!this.clickMap[row]) this.clickMap[row] = [];
				this.clickMap[row][col] = pixels[i+3] == 0 ? 0 : 1;
			}
			
			console.log(col);
			
			/*
			var totalOfType = 0;
			
			for (x in this.clickMap){
				for (y in this.clickMap[x]){
					if (this.clickMap[x][y] == 0){
						totalOfType++;
					}
				}
			}
			
			console.log(totalOfType);
			*/
		}
	});

var screenChangeSprite = clickSprite.extend(function(top, left, image, id, targetScreen){
	this.targetScreen = targetScreen;
	this.containerScreen;
})
	.methods({
		onClick: function(){
			this.targetScreen.fadingIn(1);
			this.containerScreen.fadingOut(1);
		}
	});
