/*
 * This screen, although not actually a dialogue screen, gets
 * treated as one by the dialogue that activates it
 */
var SwitchScreen = Screen.extend(function(id){
	this.screenArray = g.availableScreens;
	this.classes = ['dialogue'];
	var centerX = g.origins.width / 2;
	var centerY = g.origins.height / 2;
	this.width = 300; //arbitrary size here
	this.height = this.screenArray.length * 50; //provide 50px per entry
	this.selectedOption = -1;
	this.activateBlock = false;
	this.bottomSprite = new Sprite('bottomSprite', 0, 0, 'Sprites/Dialogue/bottom_dialogue.png', 1);
  this.bottomSprite.changeTop(g.origins.height - this.bottomSprite.height);
  this.spriteArray.push(this.bottomSprite);
  this.top = this.bottomSprite.top + 100;
  this.left = this.bottomSprite.left + 100;
	this.css = {
		top: this.top + 'px',
		left: this.left + 'px',
		opacity: 0.0,
		width: this.width + 'px',
		height: this.height + 'px'
	};
})
	.methods({
		update: function(){
			//need to do mouse detection here
			if(g.activeDialogue == this.id && !this.activateBlock){
				var mouse = g.input.mouse;
				mouse.X -= g.origins.left + this.left;
				mouse.Y -= g.origins.top + this.top;
				if((mouse.X > 0) && (mouse.X <= this.width)
					&& (mouse.Y > 0) && (mouse.Y <= this.height)){
					
					this.selectedOption = Math.floor(mouse.Y / 50);
					
					if (mouse.click) {
						var target = this.screenArray[this.selectedOption].id;
						this.deActivate();
						//if the screen to exit to is not the current active screen then switch it
						if (target != g.activeScreen){
							if(g.screenCollection[target]){
								g.screenCollection[g.activeScreen].fadingOut(1);
								g.screenCollection[target].fadingIn(1);
							} else {
								console.log(target + ' is not a screen in the screen collection');
							}
						}
					}
				} else {
					this.selectedOption = -1;
				}
			}
			this.activateBlock = false;
		},
		
		activate: function(){
			this.activateBlock = true;
			g.activeDialogue = this.id;
			this.css['opacity'] = 1.0;
		},
		
		deActivate: function(){
			g.activeDialogue = null;
			this.css['opacity'] = 0.0;
		},
		
		draw: function(HTML){
			if(g.activeDialogue == this.id){
				HTML.push('<div id="', this.id, '" class="dialogueWrapper">');
				for(i in this.spriteArray){
					this.spriteArray[i].draw(HTML);
				}
				HTML.push('<div style="');
				for(i in this.css){
					HTML.push(i, ': ', this.css[i], '; ');
				}
				HTML.push('" class="');
				for(i in this.classes){
					HTML.push(this.classes[i], ' ');
				}
				HTML.push('" > ');
				for(i in this.screenArray){
					HTML.push('<div style="top:', i*50, 'px; left: 5px; z-index: 2; color: #ffffff;');
					if (i == this.selectedOption) {
						HTML.push('background-color: #800000;');
					}
					HTML.push('"> ', this.screenArray[i].name, ' </div>');
				}
				HTML.push('</div> </div>');
			}
		}
	});
