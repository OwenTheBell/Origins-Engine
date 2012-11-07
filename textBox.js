var textBox = klass(function(id, text, left, top, color, zIndex, size){
  this.id = id;
  this.text = text;
  this.top = top;
  this.left = left;
  this.color = color;
  var ruleCSS = {
    color: this.color,
    'z-index': zIndex,
    'font-size': size
  };
  helper.addCSSRule('#' + this.id, ruleCSS);
  this.css = {
    top: top + 'px',
    left: left + 'px'
  };
})
  .methods({
    update: function(){
    },
    draw: function(HTML){
      HTML.push('<div id="', this.id, '" style="');
      for(i in this.css){
        HTML.push(i, ':', this.css[i], '; ');
      }
      HTML.push('" >', this.text, '</div>');
    }
  });

var inputBox = klass(function(id, left, top, width, height, zIndex){
  this.id = id;
  this.left = left;
  this.top = top;
  this.width = width;
  this.height = height;
  this.zIndex = zIndex;
	this.acceptedInput = '';
	this.collectedInput = '';
  var ruleCSS = {
    'z-index': zIndex,
    width: width + 'px',
    height: height + 'px'
  };
  helper.addCSSRule('#' + this.id, ruleCSS);
  this.css = {
    top: top + 'px',
    left: left + 'px'
  };
})
  .methods({
    update: function(){
			if (g.input.key.press){
				keyValue = g.input.key.value;
				if (keyValue == 13){
					this.acceptedInput = this.collectedInput;
				} else if (((keyValue >= 65) && (keyValue <= 90)) || ((keyValue >= 97) && (keyValue <= 122))){
					this.collectedInput += String.fromCharCode(keyValue);
				} else if (keyValue == 8){
					this.collectedInput = this.collectedInput.slice(0, this.collectedInput.length - 1);
				}
			}

    },
    draw: function(HTML){
      HTML.push('<div id="' + this.id + '" style="');
      for(x in this.css){
        HTML.push(x, ':', this.css[x], '; ');
      }
      HTML.push('" >' + this.collectedInput + '</div>');
    }
  });

var numInputBox = inputBox.extend(function(id, left, top, width, height, zIndex){
})
	.methods({
		update: function(){
			if (g.input.key.press){
				keyValue = g.input.key.value;
				if (keyValue == 13){
					this.acceptedInput = this.collectedInput;
				} else if ((keyValue >= 48) && (keyValue <= 57)){
					this.collectedInput += String.fromCharCode(keyValue);
				} else if (keyValue == 8){
					this.collectedInput = this.collectedInput.slice(0, this.collectedInput.length - 1);
				}
			}
		}
	});


var xmlTextBox = klass(function(xml){
  this.xml = xml;
  this.length = null;
  this.finish = false;
  this.written = 0;
  this.timeUpdate = g.getTime();
})
  .methods({
    reset: function(){
      this.lenght = null;
      this.finish = false;
      this.written = 0;
    },
    update: function(){
      if (!this.length){
        var tLength = 0;
        for(i in this.xml){
          var variable = $(this.xml[i]).find('variable').text();
          if (variable){
            if(g.playerInput[variable]){
              tLength += g.playerInput[variable].length;
            } else {
              tLength = null;
              break;
            }
          } else {
            tLength += $(this.xml[i]).text().length;
          }
        }
        this.length = tLength;
      }
      if (this.written >= this.length){
        this.finish = true;
      } else {
        if ((g.getTime() - this.timeUpdate) > (1000 / (g.fps / 1))){
         this.timeUpdate = g.getTime();
         this.written++;
       }
       //console.log(this.written);
     }
    },
    //because of the way that dialogue works this draw statement returns HTML rather
    //than appending to an existing array of HTML strings
    draw: function(){
      var HTML = [];
      var writing = 0;
      for(i in this.xml){
        var xml = this.xml[i]; 
        var color = $(xml).attr('color');
        if (color){
          if(color === 'hex color value') {
            color = '#FFOOFF';
          }
          HTML.push('<font color="', color, '">');
        }
        //Check to see if there is a declared variable instead of plain text
        var printString = '';
        var variable = $(xml).find('variable').text();
        if (variable){
          //Confirm variable exists
          if (g.playerInput[variable]) {
            printString = g.playerInput[variable];
            //HTML.push(g.playerInput[variable]);
          } else {
            printString = 'Variable undeclared';
            //HTML.push('Variable undeclared');
          }
        } else {
          //otherwise just grab the xml text
          printString = $(xml).text();
          //HTML.push($(xml).text());
        }
        if (writing + printString.length < this.written){
          writing += printString.length;
          HTML.push(printString);
        } else {
          var splice = this.written - writing;
          HTML.push(printString.substring(0, splice));
          if (color){
            HTML.push('</font>');
          }
          break;
        }
        if(color){
          HTML.push('</font>');
        }
      }
      return HTML.join('');
    }
  });
