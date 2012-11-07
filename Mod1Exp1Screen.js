var specialA = 0.0001;

var Mod1Exp1Screen = Screen.extend(function(id){
  this.setup = false;
  this.magLvls = [];
  this.activeMag = {};
})
  .methods({
    placeStars: function(){
      var magCount = -1;
      //pull out all the place holder sprites and replace them with what
      //we actually want, the clickStars
      for(id in this.spriteArray){
        if(id.match('background')){
         magCount++;
         var sprite = this.spriteArray[id];
         delete this.spriteArray[id];
         var magLvl = new MagLevel(sprite);
         this.magLvls.push(magLvl); 
        }
        if(id.match('Variable') ||
          id.match('Supernova') ||
          id.match('DiskGal') ||
          id.match('ColGal') ||
          id.match('SpirGal')){
          var sprite = this.spriteArray[id];
          var top = Math.floor(Math.random() * g.origins.height);
          //limit the width to prevent overlaying of UI with targets
          var left = Math.floor(Math.random() * 1000);
          var temp = new clickStar(id, left, top, sprite.image.src, sprite.zIndex, magCount);
          temp.parent = this;
          delete this.spriteArray[id];
          this.magLvls[magCount].addSprite(temp);
        }
      }
      this.activeMag = this.magLvls[0];
      this.activeMag.loadSprites(this.spriteArray);
      this.setup = true;
    },
    update: function(){
      this.supr();
      if (!this.setup) this.placeStars();
      if (this.confirmedSprite){
        if (this.confirmedSprite.id.match('MagLvl.')){
          var temp = this.confirmedSprite.id[6] - 1;
          if (this.activeMag != this.magLvls[temp]){
            this.activeMag.removeSprites(this.spriteArray);
            this.activeMag = this.magLvls[temp];
            this.activeMag.loadSprites(this.spriteArray);
          }
        }
      }
    },
    draw: function(HTML){
      if(this.css['opacity'] > 0){
        HTML.push('<div id=', this.id, ' style=');
        for(x in this.css){
          HTML.push(x, ': ', this.css[x], '; ');
        }
        if (this.classes.length > 0){
          HTML.push('" class="');
          for(x in this.classes){
            HTML.push(this.classes[x], ' ');
          }
        }
        HTML.push('" >');
        for(x in this.spriteArray){
          this.spriteArray[x].draw(HTML);
        }
        HTML.push('</div>');
      }
    }
  });

/*
  These are responsible for adding and removing sprites from the game view
*/
var MagLevel = klass(function(background){
  this.spriteArray = [];
  this.spriteArray[background.id] = background;
})
  .methods({
    addSprite: function(sprite){
      this.spriteArray[sprite.id] = sprite;
    },
    loadSprites: function(sprites) {
      for (i in this.spriteArray){
        sprites[i] = this.spriteArray[i];
      }
    },
    removeSprites: function(sprites) {
      for(i in this.spriteArray) {
        delete sprites[i];
      }
    },
    draw: function(HTML){
      for(i in this.spriteArray){
        this.spriteArray[i].draw(HTML);
      }
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
})
  .methods({
    onClick: function() {
      console.log('%s has z of %s and r of %s', this.id, this.redShift, this.distance);
    }
  });
