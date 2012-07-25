var textBox = klass(function(text, left, top, color, zIndex, size){
	this.text = text;
	this.top = top;
	this.left = left;
	this.color = color;
	this.css = {
		top: this.top + 'px',
		left: this.left + 'px',
		color: this.color,
		'z-index': zIndex,
		'font-size': size
	}
})
	.methods({
		update: function(){
			
		},
		draw: function(){
			var HTML = '<div style="';
			for(i in this.css){
				HTML += i + ':' + this.css[i] + '; ';
			}
			HTML += '" >' + this.text + '</div>';
			return HTML;
		}
	});
