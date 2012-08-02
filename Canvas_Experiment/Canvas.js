/*
 * This is both wrapper for a canvas object as well as for generating the necessary
 * HTML to get outed to the DOM for the canvas to display on. Actual rendering is
 * handered by prerendering to a canvas object in memory and then using drawImage
 * to actually put that canvas object on the DIV
 */
var Canvas = klass(function(id, width, height, zIndex){
	this.id = id;
	//these values cannot be put into css the DOM requries them to
	//render the canvas element properly
	this.width = width;
	this.height = height;
	this.top = 0;
	this.left = 0;
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height
	this.canvas.setAttribute('id', this.id);
	this.canvas.style.zIndex = zIndex;
	this.context = this.canvas.getContext('2d');
	this.HTML = ''
})
	.methods({
		update: function(){
		},
		draw: function(){
			//no need to return more than a blank sting as the actual canvas object will be appended later
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

