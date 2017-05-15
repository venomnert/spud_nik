//Create a list of spud container 
var numOfSpuds = $(".spud-list__spud-container").length;
console.log(numOfSpuds);

//Generate a list of x random numbers from 0 - spudContainer.length

var randomNumList = [];

function randomNumGenerator (numofRandom) {
	for(var i = 0; i < numofRandom; i++) {
		var randomNum = Math.floor(Math.random() * numOfSpuds);
		randomNumList.push(randomNum);
	}
}

randomNumGenerator();
console.log(randomNumList)
//Pass list of random numbers to animate function
	//Animate function will apply animate to the passed indexes
		//Each spud is going have the following action:
			//When the spud is clicked, stop animation, change image and add points

//Repeat steps 3 - 8