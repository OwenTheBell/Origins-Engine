var StandardCandlesScreen = Screen.extend(function(id){
	this.gameHeight = 485;
	this.gameWidth = 1280;
	this.mausCount = 5;
})
	.methods({
		addSprite: function(newSprite){
			if (newSprite.id === 'maus'){
				for(var i = 1; i <= this.mausCount; i++){
					var top = Math.floor(Math.random() * (this.gameHeight - newSprite.height));
					var left = Math.floor(Math.random() * (this.gameWidth - newSprite.width));
					var sprite = new moveableSprite(newSprite.id + i, left, top, newSprite.image.src, newSprite.zIndex);
					sprite.scaleTo(i * 0.1 + 0.5);
					sprite.classes.push('maus');
					console.log('adding ' + sprite.id);
					this.supr(sprite)
				}
			} else {
				this.supr(newSprite);
			}
		},
		update: function(){
			this.supr();
			if(this.confirmedSprite instanceof moveableSprite){
				this.spriteArray['arachne_icon'].moveTo(this.confirmedSprite.left, this.confirmedSprite.top, 1);
			}
		}
	})
