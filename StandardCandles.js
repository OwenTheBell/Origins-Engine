var StandardCandlesScreen = Screen.extend(function(id){
	this.gameHeight = 485;
	this.gameWidth = 1280;
})
	.methods({
		addSprite: function(newSprite){
			if (newSprite.top === null){
				newSprite.changeTop(Math.floor(Math.random() * (this.gameHeight - newSprite.height)));
				newSprite.changeLeft(Math.floor(Math.random() * (this.gameWidth- newSprite.width)));
			}
			this.supr(newSprite);
		}
	})
