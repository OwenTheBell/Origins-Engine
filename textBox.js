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
		top: this.top + 'px',
		left: this.left + 'px'
	};
})
	.methods({
		update: function(){
			
		},
		draw: function(){
			var HTML = '<div id="' + this.id + '" style="';
			for(i in this.css){
				HTML += i + ':' + this.css[i] + '; ';
			}
			HTML += '" >' + this.text + '</div>';
			return HTML;
		}
	});
