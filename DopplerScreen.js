//global variable container for this game
var doppler = {
	canvas: {},
	context: {},
	reciever: {},
	emitter: {},
	target: {},
	elements: [],
	Mouse: {},
	Frames: 0,
	generate: .5, //this puts 120 pixels horizontally between peaks
	waveDict: {},
	degError: 3,
	matchedAt: null
}

var DopplerScreen = Screen.extend(function(id, zIndex){
	// doppler.canvas = document.getElementById('myCanvas');
	// //append these values to canvas since it doesn't normally have them
	// doppler.canvas.left = $('#myCanvas').position().left;
	// doppler.canvas.top = $('#myCanvas').position().top;
	// doppler.context = g.canvas.getContext('2d');
// 	
	// doppler.emitter = new Emitter(g.canvas.width / 2, g.canvas.height / 2, 5, g.generate);
	// var randX = Math.floor(Math.random() * (g.canvas.width - 200) + 100);
	// var randY = Math.floor(Math.random() * (g.canvas.height - 200) + 100);
	// doppler.reciever = new Reciever(randX, randY, 5);
	// doppler.target = new Target([0, 120, 240, 360]);
	// doppler.elements.push(g.emitter);
	// doppler.elements.push(g.reciever);
	// doppler.elements.push(g.target);
})
	.methods({
		update: function(){
			this.supr();
		},
		draw: function(){
			return this.supr(); 
		}
	});
