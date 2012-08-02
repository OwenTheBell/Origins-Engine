var audioElement = klass(function (id, path) {
	this.id = id;
	this.element = document.createElement('audio');
	if ($.browser.webkit || $.browser.msie){ //covers Safari, Chrome, and IE
		this.element.setAttribute('src', path + '.mp3');
		this.element.setAttribute('type', 'audio/mp3');
	} else if ($.browser.mozilla || $.browser.opera){ //Firefox & Opera
		this.element.setAttribute('src', path + '.ogg');
		this.element.setAttribute('type', 'audio/ogg');
	} else {
		console.log('WTF browser are you using?!');
	}
	this.element.load();
	g.audioDiv.appendChild(this.element);
})
	.methods({
		play: function(){
			this.element.play();
		},
		pause: function(){
			this.element.pause();
		},
		stop: function(){
			this.element.pause();
			this.currentTime=0;
		}
	});