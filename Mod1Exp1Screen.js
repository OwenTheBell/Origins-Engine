var specialA = 0.0001;

var Mod1Exp1Screen = Screen.extend(function(id){
  this.setup = false;
})
  .methods({
    placeStars: function(){
      this.stars = [];
      //pull out all the place holder sprites and replace them with what
      //we actually want, the clickStars
      for(id in this.spriteArray){
        if(id.match('Variable') || id.match('Supernova')){
          //console.log(id);
          var sprite = this.spriteArray[id];
          var top = Math.floor(Math.random() * g.origins.height);
          var left = Math.floor(Math.random() * g.origins.width);
          var temp = new clickStar(id, left, top, sprite.image.src, sprite.zIndex, 0);
          delete this.spriteArray[id];
          this.addSprite(temp);
        }
      }
      this.setup = true;
    },
    update: function(){
      this.supr();
      if (!this.setup) this.placeStars();
    }
  });

var clickStar = clickSprite.extend(function(id, left, top, image, zIndex, dis){
  //distance of the star in parsecs
  this.distance = Math.ceil(Math.random() * 10) + (dis * 10);
  var year = 31556900000; //number of milliseconds in a year
  //time is calculated in years
  //the 3.26 converts the distance from parsecs to light years
  var time = (5 + (dis * 10)) * 3.26;
  var functionOfT = specialA * Math.pow(Math.E, specialA * time);
  this.redShift = functionOfT * this.distance;
  //console.log('%s has z of %s and r of %s', this.id, this.redShift, this.distance);
})
  .methods({
    onClick: function() {
      console.log('%s has z of %s and r of %s', this.id, this.redShift, this.distance);
    }
  });
