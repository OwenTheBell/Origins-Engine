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
      //return HTML;
    }
  });

var xmlTextBox = klass(function(xml){
  this.xml = xml;
})
  .methods({
    //because of the way that dialogue works this draw statement returns HTML rather
    //than appending to an existing array of HTML strings
    draw: function(){
      HTML = [];
      $(this.xml).each(function(){
        var color = $(this).attr('color');
        if (color){
          if(color === 'hex color value') {
            color = '#FFOOFF';
          }
          HTML.push('<font color="', color, '">');
        }
        //Check to see if there is a declared variable instead of plain text
        var variable = $(this).find('variable').text();
        if (variable){
          //Confirm variable exists
          if (g.playerInput[variable]) {
            HTML.push(g.playerInput[variable]);
          } else {
            HTML.push('Variable undeclared');
          }
        } else {
          //otherwise just grab the xml text
          HTML.push($(this).text());
        }
        if(color){
          HTML.push('</font>');
        }
      });
      return HTML.join('');
    }
  });
