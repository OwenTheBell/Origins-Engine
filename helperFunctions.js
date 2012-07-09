/*
 * This is a collection of functions that are used various places to helper
 * accomplish tasks. They are contained within the helper object just to make
 * locating them easier during code maintenance
 */

var helper = {

	ajaxGet: function(dialogueScreen){
		$.ajax({
			async: false,
			type: "GET",
			url: dialogueScreen.file,
			dataType: "xml",
			success: function(data){
				dialogueScreen.loadXML(data);
			}
		});
	},
	
	groupItemAjaxGet: function(dialogueScreens, file){
		var extData;
		$.ajax({
			async: false,
			type: 'GET',
			url: file,
			dataType: 'xml',
			success: function(data){
				$(data).find('item').each(function(){
					var temp = new DialogueScreen($(this).attr('id'), g.bottomZIndex);
					temp.loadXML(this);
					dialogueScreens[temp.id] = temp;
				});
			}
		});
	},
	
	cloneObj: function(obj){
		var newObj = {};
		for (i in obj){
			if (i == 'clone') continue;
			if (obj[i] && typeof obj[i] == "object") {
				newObj[i] = this.cloneObj(obj[i]);
			} else {
				newObj[i] = obj[i];
			}
		}
		return newObj;
	},
	
	debugPrint: function(x, y){
		console.log('(' + x + ',' + y + ')');
	},

	findCSSRule: function(rule){
		var mysheet = document.styleSheets[0];
		var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
		for (i in myrules){
			if (myrules[i].selectorText && myrules[i].selectorText.toLowerCase() === rule){
				return myrules[i];
			}
		}
		console.log('ERROR: css rule ' + rule + ' not found');
	}
}
