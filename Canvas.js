/*
 * This is both wrapper for a canvas object as well as for generating the necessary
 * HTML to get outed to the DOM for the canvas to display on. Actual rendering is
 * handered by prerendering to a canvas object in memory and then using drawImage
 * to actually put that canvas object on the DIV
 */
var Canvas = klass(function(id, left, top, width, height, zIndex){
	this.id = id;
	this.top = top;
	this.left = left;
	//these values cannot be put into css as the DOM requries them to
	//render the canvas element properly
	this.width = width;
	this.height = height;
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height
	this.canvas.setAttribute('id', this.id);
	this.canvas.style.zIndex = zIndex;
	this.canvas.style.top = this.top + 'px';
	this.canvas.style.left = this.left + 'px';
	this.context = this.canvas.getContext('2d');
})
	.methods({
		update: function(){
		},
		//this just returns the html needed to create a canvas object to draw the canvas to
		draw: function(){
			return '';
		},
		//this function handles the actual canvas rendering
		canvasDraw: function(){
			return this.canvas;
		},
		clear: function(){
			this.context.clearRect(0, 0, this.width, this.height);
		}
	});

