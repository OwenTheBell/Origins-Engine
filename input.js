var inputState = {
	aKeyDown: false,
	sKeyDown: false,
	dKeyDown: false,
	wKeyDown: false,
		
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
	if (e.which == 65){ //a
		inputState.aKeyDown = true;
	} else if (e.which == 68) { //d
		inputState.dKeyDown = true;
	} else if (e.which == 87) { //w
		inputState.wKeyDown = true;
	} else if (e.which == 83) { //s
		inputState.sKeyDown = true;
	}
});

//keyup triggers
$(document).keyup(function(e){
	if (e.which == 65){ //a
		inputState.aKeyDown = false;
	} else if (e.which == 68) { //d
		inputState.dKeyDown = false;
	} else if (e.which == 87) { //w
		inputState.wKeyDown = false;
	} else if (e.which == 83) { //s
		inputState.sKeyDown = false;
	}
});

//mouse input triggers
$(document).mousedown(function(e){
	if (e.which == 1){
		inputState.mouseClick = {X: e.pageX, Y: e.pageY, happened: true};
		//debugPrint(e.pageX, e.pageY);
	}
});

$(document).mouseup(function(e){
	if (e.which == 1){
		inputState.mouseClick.happened = false;
	}
});
