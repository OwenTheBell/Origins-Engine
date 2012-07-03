/*
 * inputState should not be accessed directly by anything other than globalInput.
 * The reason for this is to ensure that there is one consistent copy of input for
 * each iteration of the loop that is then updated. This is because inputState is 
 * updated by input which occurs independent of the game loop happening.
 */
var inputState = {
	
	shiftDown: false,
	
	pressed: [],
	
	key: {
		values: [],
		press: false,
	},
	
	mouse: {
		X: -1,
		Y: -1,
		click: false, //input rejected value
		down: false,
	},
	
	getKey: function(){
		var returnKey = helper.cloneObj(this.key);
		returnKey.value = returnKey.values[0];
		this.key.press = false;
		return returnKey;
	},
	
	getMouse: function(){
		var returnMouse = helper.cloneObj(this.mouse);
		if (this.mouse.click){
			this.mouse.click = false;
		}
		return returnMouse;
	}
}

$(document).keydown(function(e){
	if (e.which == 16){
		inputState.shiftDown = true;
	} else {
		if(!inputState.shiftDown && ((e.which >= 65) && (e.which <= 90))){
			if (inputState.key.values.indexOf(e.which + 32) == -1){
				inputState.key.values.push(e.which + 32);
				if(inputState.key.values.length == 1){
					inputState.key.press = true;
				}
				console.log(inputState.key.values);
			}
		} else {
			if (inputState.key.values.indexOf(e.which) == -1){
				inputState.key.values.push(e.which);
				if(inputState.key.values.length == 1){
					inputState.key.press = true;
				}
				console.log(inputState.key.values);
			}
		}
	}
});

$(document).keyup(function(e){
	//only disrupt the key press if it is the key registered as down
	if (e.which == 16){
		inputState.shiftDown = false;
	} else if (inputState.key.values.indexOf(e.which) > -1){
		var target = inputState.key.values.indexOf(e.which);
		inputState.key.values.splice(target, 1);
		inputState.key.press = true;
		console.log(inputState.key.values);
		//inputState.key.press = false;
	} else if (inputState.key.values.indexOf(e.which + 32) > -1){
		var target = inputState.key.values.indexOf(e.which + 32);
		inputState.key.values.splice(target, 1);
		inputState.key.press = true;
		console.log(inputState.key.values);
		//inputState.key.press = false;
	}
});

//mouse input
$(document).mousemove(function(e){
	inputState.mouse.X = e.pageX;
	inputState.mouse.Y = e.pageY;
});

$(document).mousedown(function(e){
	e.preventDefault(); //this prevents objects from getting highlighted and dragged
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
