var Screen = klass(function(id, zIndex, opacity) {
	this.id = id
	this.spriteArray = [];
	//Not sure if I need this, this was for when the clickMap was going to be
	//contained on the screen not each individual image
	//this.clickArray = [];
	this.fadeOut = false;
	this.fadeIn = false;
	this.timeIn;
	this.drawState = 'new';
	
	this.zIndex = zIndex;
	this.opacity = opacity;
	
	this.transitionFrames = 0;
	this.transitionFramesCount = 0;
	
	//The screen requires a div so that it can contain sprites
	this.repDiv = jQuery('<div>', {
		id: this.id
	});
	this.repDiv.css({
		position: 'inherit',
		opacity: this.opacity,
		'z-index': this.zIndex
	});
})
	.methods({
		addSprite: function(newSprite){
			newSprite.containerScreen = this;
			this.spriteArray.push(newSprite);
		},
			
	/*
	 * This method runs into the issue that the sprite has to be removed from
	 * the DOM. This means that some tracker needs to be put in place that will
	 * know that the sprite needs to be removed at draw.
	 * One answer might be to allow the sprite to persist until draw(). At that
	 * point the sprite removes itself from the DOM and from the screen.
	 * Alternatively the sprite could handle removal from the DOM and then the
	 * screen could remove the sprite after completing the draw methods or at
	 * the beginning of the next update.
	 */
		removeSprite: function(id){	
			var x;
			for (x in this.spriteArray){
				if (this.spriteArray[x].id === id){
					this.spriteArray[x].drawState = 'removed';
					break;
				}
			}
		},
		getSprite: function(id){
			for (x in this.spriteArray){
				if (this.spriteArray[x].id === id){
					return this.spriteArray[x];
				}
			}
		},
		fadingOut: function(seconds){
			this.fadeOut = true;
			this.transitionFrames = seconds*fps;
			this.transitionFramesCount = 0;
		},
		//seconds: the number of seconds for the transition
		fadingIn: function(seconds){
			this.fadeIn = true;
			this.transitionFrames = seconds*fps;
			this.zIndex = 10;
			this.drawState = 'updated';
		},
		update: function(){
			//Check if any sprites have been clicked
			if (this.fadeIn){
				if (this.opacity >= 1.0){
					this.opacity = 1.0;
					this.fadeIn = false;
					this.zIndex--;
					console.log('transition complete');
				} else {
					//Increment up the opacity
					this.opacity += (1 / this.transitionFrames);
				}
				this.drawState = 'updated';
				//console.log(this.opacity);
			} else if (this.fadeOut){
				/*
				if (this.transitionFramesCount >= this.transitionFrames){
					this.opacity = 0.0;
					this.zIndex--;
					console.log(this.id + ' moving to background');
					this.fadeOut = false;
				} else {
					this.transitionFramesCount++;
				}
				*/
				
				if (this.opacity <= 0.0){
					this.opacity = 0;
					this.fadeOut = false;
					this.zIndex--;
					console.log(this.id + " moving to background");
				} else {
					this.opacity -= (1 / this.transitionFrames);
				}
				
				this.drawState = 'updated';
			}
			
			var mouseInput = false;
			//Only take input if this is the frame on top
			if (this.opacity == 1.0){
				mouseInput = inputState.checkLeftClick();
			}
			
			for (x in this.spriteArray){
				var testSprite = this.spriteArray[x];
				if (mouseInput && (this.spriteArray[x] instanceof clickSprite)){
					if ((mouseInput.X >= testSprite.left + parseInt($('#origins').css('left'))) && 
						(mouseInput.X <= testSprite.left + testSprite.width() + parseInt($('#origins').css('left'))) &&
						(mouseInput.Y >= testSprite.top  + parseInt($('#origins').css('top'))) &&
						(mouseInput.Y <= testSprite.top + testSprite.height() + parseInt($('#origins').css('top')))){
							testSprite.clicked = true;
						}
				}
				testSprite.update();
			}
		},
		draw: function(){
			//Draw state is necessary since then we can assure that we avoid
			//unneeded redraws
			if (this.drawState === 'new') {
				$('#origins').append(this.repDiv);
			} else if (this.drawState === 'updated'){
				//In theory we should only ever be updating the screen css
				//if (this.fadeIn)
				this.repDiv.css({
					opacity: this.opacity,
					'z-index': this.zIndex
				});
			} else if (this.drawState === 'removed') {
				$('#' + this.id).remove();
			} else if (this.drawState === 'unchanged') {
			} else {
				console.log("ERROR: invalid screen draw state: " + this.id);
			}
			this.drawstate = 'unchanged';
			
			for (img in this.spriteArray){
				this.spriteArray[img].draw();
			}
		}
	});
