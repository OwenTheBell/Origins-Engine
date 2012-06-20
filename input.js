var inputState = {
	keydown: false,
	keydownvalue: -1,
	
	keypressed: false,
	keypressvalue: -1,
	
	getKeyPressValue: function(){
		this.keypressed = false;
		return this.keypressvalue;
	},
		
	mouseClick: {
		X: -1,
		Y: -1,
		happened: false
	},
	
	/*
	 * Use this function to get mouse input rather than checking mouseClick
	 * directly
	 * 
	 * Returns {X:x, Y:y} in the event new mouse input has not been checked and
	 * then sets the event variable to false to prevent further checking.
	 * If mouse input has been checked then the function return false instead
	 * of an object
	 */
	checkLeftClick: function(){
		if (this.mouseClick.happened){
			this.mouseClick.happened = false;
			return {X: this.mouseClick.X, Y: this.mouseClick.Y};
		}
		return false;
	}
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
