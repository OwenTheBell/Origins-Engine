var Screen = klass(function(id, zIndex) {
	this.id = id
	this.spriteArray = [];
	//Not sure if I need this, this was for when the clickMap was going to be
	//contained on the screen not each individual image
	//this.clickArray = [];
	this.fadeOut = false;
	this.fadeIn = false;
	this.timeIn;
	this.drawState = 'new'; // new/updated/removed/unchanged
	this.activeScreen = false;
	this.opacity = 0.0
	
	this.zIndex = zIndex;
	//set opacity based on whether or not this screen is on the top zIndex
	if ((this.zIndex == topZIndex) || (this.zIndex == dialogueZIndex)) {
		this.opacity = 1.0;
		//this.activeScreen = true;
	}
	
	this.transitionFrames = 0;
	this.transitionFramesCount = 0;
	
	//The screen requires a div so that it can contain sprites
	this.repDiv = jQuery('<div>', {
		id: this.id
	});
	this.repDiv.css({
		position: 'inherit',
		opacity: this.opacity,
		'z-index': this.zIndex,
	});
	
	this.css = {
		'postion': 'inherit',
		'opaciy': this.opacity,
		'z-index': this.zIndex
	}
	//if(this instanceof DialogueScreen) {}
	//else console.log('Generating screen of id ' + this.id);
	
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
			console.log(this.id + ' moving to background');
			this.activeScreen = false;
		},
		//seconds: the number of seconds for the transition
		fadingIn: function(seconds){
			this.fadeIn = true;
			this.transitionFrames = seconds*fps;
			this.zIndex = transZIndex;
			this.drawState = 'updated';
		},
		update: function(){
			//Check if any sprites have been clicked
			if (this.fadeIn){
				if (this.opacity >= 1.0){
					this.opacity = 1.0;
					this.fadeIn = false;
					this.fadeOut = false;
					this.zIndex = topZIndex;
					this.activeScreen = true;
					console.log(this.id + ' in foreground');
				} else {
					this.opacity += (1 / this.transitionFrames);
				}
				this.drawState = 'updated';
			} else if (this.fadeOut){
				if (this.opacity <= 0.0){
					this.opacity = 0.0;
					this.fadeOut = false;
					this.fadeIn = false;
					this.zIndex = bottomZIndex;
				} else {
					this.opacity -= (1 / this.transitionFrames);
				}
				
				this.drawState = 'updated';
			}
			
			var mouseInput = false;
			var mousePos = {};
			var mouseOverCheck = false;
			//Only take input if the screen is not transitioning
			if (this.activeScreen){
				mouseInput = inputState.checkLeftClick();
				mousePos = inputState.mousePos;
			}
			
			for (var x = 0; x < this.spriteArray.length; x++){
				var testSprite = this.spriteArray[x];
				if (testSprite instanceof clickSprite){
					if (mouseInput){
						if ((mouseInput.X > testSprite.left + parseInt($('#origins').css('left'))) && 
							(mouseInput.X <= testSprite.left + testSprite.width() + parseInt($('#origins').css('left'))) &&
							(mouseInput.Y > testSprite.top + parseInt($('#origins').css('top'))) &&
							(mouseInput.Y <= testSprite.top + testSprite.height() + parseInt($('#origins').css('top')))){
								testSprite.clicked(mouseInput.X, mouseInput.Y);
							}
					}
					/*
					if ((mousePos.X > testSprite.left + parseInt($('#origins').css('left'))) && 
						(mousePos.X <= testSprite.left + testSprite.width() + parseInt($('#origins').css('left'))) &&
						(mousePos.Y > testSprite.top + parseInt($('#origins').css('top'))) &&
						(mousePos.Y <= testSprite.top + testSprite.height() + parseInt($('#origins').css('top')))){
							mouseOverCheck = true;
						}
					*/
				}
				testSprite.update();
			}
		},
		draw: function(){
			//So we should be able to simplify the draw if each screen features a total redraw
			//There could well be big issues with this total redraw, though, so we'll see how this works
			//One thing I am pretty worried about, though, is how expensive creating and joining all
			//these arrays might turn out to be
			
			if(this instanceof DialogueScreen) {}
			else {
				var returnedHTML = [];
				$(this.spriteArray).each(function(){
					returnedHTML.push(this.draw());
				})
				var myHTML = [];
				myHTML.push('<div id =' + this.id + ' style="');
				for(x in this.css){
					myHTML.push(x + ':' + this.css[x] + '; ');
				}
				myHTML.push('">');
				
				return(myHTML.join('') + returnedHTML.join('') + '</div>');
				
			}
			
			/*
			//Draw state is necessary since then we can assure that we avoid
			//unneeded redraws
			if (this.drawState === 'new') {
				$('#origins').append(this.repDiv);
				if(this instanceof DialogueScreen) {}
				else {
					var returnedHTML = [];
					$(this.spriteArray).each(function(){
						returnedHTML.push(this.draw());
					})
					var myHTML = [];
					myHTML.push('<div id =' + this.id + ' style="');
					for(x in this.css){
						myHTML.push(x + ':' + this.css[x] + '; ');
					}
					myHTML.push('">');
					
					return(myHTML.join('') + returnedHTML.join('') + '</div>');
					
				}
				
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
				//no need to do anything here
			} else {
				console.log("ERROR: invalid screen draw state: " + this.id);
			}
			this.drawState = 'unchanged';
			
			//for (img in this.spriteArray){
			//	this.spriteArray[img].draw();
			//}
			*/
		}
	});