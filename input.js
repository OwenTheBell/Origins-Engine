var inputState = {
	keydown: false,
	keydownvalue: -1,
	
	keypressed: false,
	keypressvalue: -1,
		
	mouse: {
		X: -1,
		Y: -1,
		clicked: false
	},
}

//keydown triggers
$(document).keydown(function(e){
	inputState.keydown = true;
	inputState.keydownvalue = e.which;
});

//keyup triggers
$(document).keyup(function(e){
	inputState.keydown = false;
	inputState.keydownvalue = -1;
});

//mouse input triggers
$(document).mousedown(function(e){
	if (e.which == 1){
		inputState.mouseClick = {X: e.pageX, Y: e.pageY, happened: true};
		//helper.debugPrint(e.pageX, e.pageY);
	}
});

$(document).mouseup(function(e){
	if (e.which == 1){
		inputState.mouseClick.happened = false;
	}
});

$(document).keypress(function(e){
	if (!inputState.keypressed){
		inputState.keypressvalue = e.which;
		inputState.keypressed = true;
	}
});

$(document).mousemove(function(e){
	inputState.mousePos = {X: e.pageX, Y: e.pageY};
});
