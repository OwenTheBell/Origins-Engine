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
        var confirmed = this.confirmedSprite;
        if (this.selectedArray.indexOf(confirmed.id) == -1){
          var x = Math.floor((confirmed.width - (confirmed.width * confirmed.scale)) / 2);
          var x = confirmed.left - x;
          var y = Math.floor((confirmed.height - (confirmed.height * confirmed.scale)) / 2);
          var y = confirmed.top - y;
          var sprite = new moveableSprite(
            confirmed.id + 'selector',
            x, y,
            this.selectorUrl,
            confirmed.zIndex);
          sprite.classes.push('maus_selector');
          //sprite.scaleTo(confirmed.scale);
          this.addSprite(sprite);
          this.selectedArray.push(confirmed.id);
        }
      }
    }
  })
