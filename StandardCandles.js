var StandardCandlesScreen = Screen.extend(function(id){
	this.gameHeight = 485;
	this.gameWidth = 1280;
	this.mausCount = 5;
	this.selectorUrl = '';
	this.selectedArray = [];
})
	.methods({
		addSprite: function(newSprite){
			if (newSprite.id === 'maus'){
				for(var i = 1; i <= this.mausCount; i++){
					var top = Math.floor(Math.random() * (this.gameHeight - newSprite.height));
					var left = Math.floor(Math.random() * (this.gameWidth - newSprite.width));
					var sprite = new clickMoveableSprite(newSprite.id + i, left, top, newSprite.image.src, newSprite.zIndex);
					sprite.scaleTo(i * 0.2);
					sprite.classes.push('maus');
					this.supr(sprite)
				}
			} else if (newSprite.id === 'maus_selector'){
				console.log(newSprite.image.src);
				this.selectorUrl = newSprite.image.src;
			} else {
				this.supr(newSprite);
			}
		},
		update: function(){
			this.supr();
			if (this.confirmedSprite instanceof moveableSprite){
				if (this.selectedArray.indexOf(this.confirmedSprite.id) == -1){
					var sprite = new moveableSprite(
						this.confirmedSprite.id + 'selector',
						this.confirmedSprite.left,
						this.confirmedSprite.top,
						this.selectorUrl,
						this.confirmedSprite.zIndex);
					sprite.classes.push('maus_selector');
					sprite.scaleTo(this.confirmedSprite.scale);
					this.addSprite(sprite);
					this.selectedArray.push(this.confirmedSprite.id);
				}
			}
		}
	})
