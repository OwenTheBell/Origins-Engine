/*
 * inputState should not be accessed directly by anything other than globalInput.
 * The reason for this is to ensure that there is one consistent copy of input for
 * each iteration of the loop that is then updated. This is because inputState is 
 * updated by input which occurs independent of the game loop happening.
 */
var inputState = {
	
	key: {
		value: null,
		down: false,
		press: false, //input rejected value
	},
	
	mouse: {
		X: -1,
		Y: -1,
		click: false, //input rejected value
		down: false,
	},
	
	getKey: function(){
		var returnKey = helper.cloneObj(this.key);
		if(this.key.press){
			this.key.press = false;
		}
		return returnKey;
		// if (this.key.press){
			// this.key.press = false;
			// return {value: this.key.value, down: this.key.down, press: true};
		// } else {
			// return this.key;
		// }
	},
	
	getMouse: function(){
		var returnMouse = helper.cloneObj(this.mouse);
		if (this.mouse.click){
			this.mouse.click = false;
		}
		return returnMouse;
		// if (this.mouse.click){
			// this.mouse.click = false;
			// return {X: this.mouse.X, Y: this.mouse.Y, click: true, down: this.mouse.down};
		// } else {
			// return this.mouse;
		// }
	}
}

$(document).keydown(function(e){
	if(!inputState.key.value){
		inputState.key.value = e.which;
		inputState.key.down = true;
		inputState.key.press = true;
	}
});

$(document).keyup(function(e){
	//only disrupt the key press if it is the key registered as down
	if (inputState.key.value == e.which){
		inputState.key.value = null;
		inputState.key.down = false;
		inputState.key.press = false;
	}
});

//mouse input
$(document).mousemove(function(e){
	inputState.mouse.X = e.pageX;
	inputState.mouse.Y = e.pageY;
});

$(document).mousedown(function(e){
	if (e.which == 1){
		inputState.mouse.click = true;
		inputState.mouse.down = true;
	}
});

$(document).mouseup(function(e){
	if (e.which == 1){
		inputState.mouse.click = false;
		inputState.mouse.down = false;
	}
});
