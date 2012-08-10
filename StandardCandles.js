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
		},
		update: function(){
			this.supr();
			// if (this.mouseCheck){
				if(this.confirmedSprite instanceof moveableSprite){
					this.spriteArray['arachne_icon'].moveTo(this.confirmedSprite.left, this.confirmedSprite.top, 1);
				}
			// }
		}
	})
