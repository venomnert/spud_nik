//GAME DATA
$(function() {
	var isHorizontal = false;
	var currentDifficulty = "medium";
	var difficultyChanged = false;
	// Default value if function fails to call num containers based on difficulty level
	var numberOfContainers = "7";

	// game time + 1 (accounts for the 1 second that is removed prior to logging to DOM)
	var maxTime = 31000;
	var gameTimer = maxTime;
	var gameTimerId;
	var inMenu = false;

	var screenSize = {
		//[screen min, screen max, spud height, hole width]
		small: [0, 480, 70, 110],
		medium: [480, 768, 120, 250],
		large: [768, 1170, 150, 285]
	}
	//Default value of height if function fails to call
	var spudHeight = 150;
	//Default value of width if function fails to call
	var holeWidth = 234;
	var containerCoords = [];
	// vertical offset to prevent overlap of holes
	var holeHeightOffset = 40;
	var activateSpuds = [];
	var totalPoints = 0;

	var levels = {
		easy: {
			numberOfContainers: 5,
		},
		medium: {
			numberOfContainers: 7,
		},
		hard: {
			numberOfContainers: 9,
		},
	}
	const characterArray = [
		'img/spud.png',
		'img/spud.png',
		'img/spud.png',
		'img/spud.png',
		'img/spud.png',
		'img/martian.png',
		'img/martian.png',
		'img/martian.png',
		'img/yukon.png',
		'img/yukon.png',
		'img/sweet_spud.png',
	];
	const characterInfo = {
		'img/spud.png': {
			points: 20,
			deadImg: 'img/spud--smoosh.png',
			description: "Clone Drone"
		},
		'img/yukon.png': {
			points: 30,
			deadImg: 'img/yukon--smoosh.png',
			description: "Corporal Yukie"
		},
		'img/sweet_spud.png': {
			points: 50,
			deadImg: 'img/sweet_spud--smoosh.png',
			description: "Sergeant Sweet P"
		},
		'img/martian.png': {
			points: -20,
			deadImg: 'img/martian--smoosh.png',
			description: "Local Yokal"
		}
	}

	// restart initalizes a game (activated after html is loaded, and again if user presses "start" button in the menu overlay)
		//A) begins "first game" after html has loaded,
		//B) clears previous game set-up and begins a new game if user changes difficulty level within menu overlay, and
		//C) returns to game if user presses "start" button in overlay menu but has not changed difficulty level (ie. they paused to game to read about it, but did not change any settings)
	function restart (firstGame) {
  		var overlay = $('.overlay');
  		//if game is playing, user is not in menu overlay, timer is running 
	  	inMenu = false;
	  		// C) return user to game, do not re-initialize set-up functions (exit this function)
	  		//[user has pressed "start" button in overlay menu (it's not the initial/first game) and has not changed difficulty level]
			if (!difficultyChanged && !firstGame) {
				overlay.hide();
				return;
			}
		// B) clear previous game set-up and start new game based on selected difficulty level
		//(difficulty level has changed, user has accessed the menu overlay and changed settings)
  		if (difficultyChanged) {
			clearInterval(gameTimerId);
			gameTimer = maxTime;
			totalPoints = 0;
			$('.points').text(totalPoints + "pts");
  			clearContainers()

  		// otherwise A) begin first game, set-up overlay character gallery and activiate difficulty buttons once, then initialize other start-up var/features
  		} else {
  			addCharacterGallery();
			activateDifficultyButtons();
  		}
  			//game set-up details (initialized once at start of game, and again if user changes difficulty level)
			numberOfContainers = levels[currentDifficulty].numberOfContainers;
			overlay.hide()
			setSpudHeight();
			drawContainers(numberOfContainers);
			containerContentZIndex(containerCoords);

			//set-up & start game timer, every 1s each if statement etc is checked
			//also activates spuds based on set time interval
			//also pauses time if in menu overlay
			gameTimerId = window.setInterval(function(){
				// every 4s call the spuds in a group and aniamte them (if not in the menu overlay)!
				if (gameTimer % 4000 === 0 && !inMenu && !isHorizontal) {
					let qtyOfSpudsToActivate = ranNumOfSpudsToActivate();
					selectSpudsToActivate(qtyOfSpudsToActivate);
					startAnimate();	
				}
				// empty spud array
				activateSpuds = [];
				//if not in the menu overlay reduce timer by 1s
				if (!inMenu && !isHorizontal) {
					gameTimer-=1000;
				}
				//send time remaining to DOM
				$('.time').text(`${gameTimer/1000}s`);
				//if time is up, reset the timer
				if (gameTimer === 0) {
					console.log('cleared');
					clearInterval(gameTimerId);
				}
			},1000);
	} //end of restart function

	// add character gallery to overlay initialized with menu button
	//called once when game is initialized as a part of the 'return' function
	function addCharacterGallery() {
	  var container = $('.characterInfoGallery');

		for (var key in characterInfo) {
		  console.log(key, characterInfo[key].points);
		  // Add to list
		  var characterInfoCell = $('<div>').addClass('characterInfoCell');
		  var characterPic = $('<div>').addClass('characterPic');
		  characterPic.css('background-image', 'url(' + key + ')');
		  var characterPointValue = $('<p>').addClass('characterPointValue').text(characterInfo[key].points + " pts");
		  var characterDescription = $('<p>').addClass('characterDescription').text(characterInfo[key].description);
		  // generate a row (cell) with all character details
		  characterInfoCell.append(characterPic);
		  characterInfoCell.append(characterPointValue);
		  characterInfoCell.append(characterDescription);
		// append the cell to the ul.characterInfoGallery
	  	container.append(characterInfoCell);

		}
	} //end of character gallery

	//called once at start of initial game
	//starts listener to check if user changed difficulty level & implements changes
	// also starts listener for start and menu buttons
	function activateDifficultyButtons() {
	  var buttonEasy = $('.button-easy');
	  var buttonMedium = $('.button-medium');
	  var buttonHard = $('.button-hard');

	  buttonEasy.on('click', function () {
	  	if (currentDifficulty !== "easy") {
	  		$('.current-difficulty').removeClass('current-difficulty');
	  		$('.button-easy').addClass('current-difficulty');
	  		difficultyChanged = true;
	  		currentDifficulty = "easy";
	  	}
	  })
	  buttonMedium.on('click', function () {
	  	if (currentDifficulty !== "medium") {
	  		$('.current-difficulty').removeClass('current-difficulty');
	  		$('.button-medium').addClass('current-difficulty');
	  		difficultyChanged = true;
	  		currentDifficulty = "medium";
	  	}
	  })
	  buttonHard.on('click', function () {
	  	if (currentDifficulty !== "hard") {
	  		$('.current-difficulty').removeClass('current-difficulty');
	  		$('.button-hard').addClass('current-difficulty');
	  		difficultyChanged = true;
	  		currentDifficulty = "hard";
	  	}
	  })

	  //set's up listener on start button (overlay)
	  // if clicked, call restart function, argument of "false" indicates user is returning to game from overlay
	  var startButton = $('.start');	  
	  startButton.on('click', function () {
	  	restart(false);
	  })

	  //set's up listener on menu button (game screen)
	  //if clicked, user is now in menu, overlay is displayed, timer is paused [component of restart()gameTimerId]
	  var menuButton = $('.menu-button');	  
	  menuButton.on('click', function () {
	  	inMenu = true;
	  	$('.overlay').show();
	  })

	} // end of activateDifficultyButtons()

	//spudHeight Setter
	function setSpudHeight(){
		var windowWidth = $(this).width();

		if (screenSize.small[0] < windowWidth && windowWidth <= screenSize.small[1]) {
			spudHeight = screenSize.small[2];
			holeWidth = screenSize.small[3];
			changeText();

		} else if (screenSize.medium[0] < windowWidth && windowWidth <= screenSize.medium[1]) {
			spudHeight = screenSize.medium[2];
			holeWidth = screenSize.medium[3];
		} else {
			spudHeight = screenSize.large[2];
			holeWidth = screenSize.large[3];
		}
	}
	function changeText() {
		$('.characterInfoGallery .characterInfoCell:nth-child(2) p:last-child').text('Corp. Yukie');
		$('.characterInfoGallery .characterInfoCell:nth-child(3) p:last-child').text('Sgt. Sweet P');
	}

	//Generate random location of container, append to html
	function generateContainers(id) {
		var minX = holeWidth * 0.5;
		var maxX = $('.spud-list').width()-1.25*holeWidth;
		var minY = spudHeight * 0.80;
		var maxY = $('.spud-list').height() - minY;

		var containerXCoord = randomNum(maxX, minX);
		var containerYCoord = randomNum(maxY, minY);

		while (!isValidY(containerYCoord)) {
			containerYCoord = randomNum(maxY, minY);
		}
		containerCoords.push({id:id, x:containerXCoord, y:containerYCoord})

		var spudContainer = $(`<li id=spud-${id} class=spud-list__spud-container></li>`);
		var hole = $("<div class='hole-content'></div>");
		var foreGround = $("<img src='img/hole--foreground.png' class='hole-content__foreground' draggable='false'>");
		var spud = $("<img class='hole-content__spud' draggable='false'>");

		spudContainer.css({
			bottom: containerYCoord + "px",
			left: containerXCoord + "px"
		});
		hole.css('width', holeWidth);
		hole.append(foreGround, spud);
		spudContainer.append(hole);
		$('.spud-list').append(spudContainer);
	}

	// draw containers, quantity is based on selected difficulty level 
	function drawContainers(numberOfContainers) {
		for (var i = 0; i < numberOfContainers; i++) {
			generateContainers(i);
		}
	}

	// clear containers
	function clearContainers() {
			$('.spud-list__spud-container').remove();
			containerCoords = [];
	}


	function randomNum(max, min) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function isValidY(yCoord) {
		var isValid = false;

		if (containerCoords.length === 0) { 
			isValid = true;
		}

		for(var i = 0; i < containerCoords.length; i++) {
			var coor = containerCoords[i];
			var upperHoleBoundary = coor.y + holeHeightOffset;
			var lowerHoleBoundary = coor.y - holeHeightOffset;
			if (upperHoleBoundary < yCoord || lowerHoleBoundary > yCoord) {
				isValid = true;
			}
			else {
				isValid = false;
				break;
			}
		}
		return isValid;
	}

	function sortContainerCoor(containers) {
		containers.sort(function (a,b) {
			return a.y - b.y;
		});
	}

	function containerContentZIndex(containerCoords) {
		sortContainerCoor(containerCoords);
		
		for (let z = containerCoords.length; z > 0; z--) {
			let i = containerCoords.length - z;
			$(`#spud-${containerCoords[i].id} .hole-content__foreground`).css('z-index', `${z*2}`);
			$(`#spud-${containerCoords[i].id} .hole-content__spud`).css('z-index', `${(z * 2) - 1}`)
		}
	}

	function ranNumOfSpudsToActivate() {
		return randomNum(Math.round(numberOfContainers * 0.75), 1);
	}
	function selectSpudsToActivate(qtyOfSpudsToActivate){
		for (var i = 0; i < qtyOfSpudsToActivate; i++) {
			var spudId = randomNum(numberOfContainers, 0);
			if (activateSpuds.length === 0) {
				activateSpuds.push(spudId);
			} else {
				if (activateSpuds.indexOf(spudId) >= 0) {
					i = i - 1;
				} else {
					activateSpuds.push(spudId);
				}
			}
		}
	}

	function animateSpud(id) {
		var spud = $(`#spud-${id} img.hole-content__spud`);
		var imgSrc = characterArray[randomNum(characterArray.length, 0)];
		spud.attr('src', `${imgSrc}`);
		spud.addClass('animate--up');
        spud.removeClass('animate--down');
        $('.spud-list').on('transitionend webkitTransitionEnd oTransitionEnd','.hole-content__spud', function () {
            $(this).removeClass('animate--up')
            $(this).addClass('animate--down');
        });
    }


	$('.spud-list').on('click', '.hole-content__spud',function () {
		var spudId = $(this).parents('li').attr('id');
		var spudImg = $(this).attr('src');
		var spudPoints = characterInfo[spudImg].points;
		var smooshedImgUrl = characterInfo[spudImg].deadImg;

		var smooshedImg = $(`<img src=${smooshedImgUrl} class="smooshedSpud--position">`);
		var zIndexSmooshed = $(this).css('z-index');

		if ($(this).hasClass('animate--up')) {
	        $(this).removeClass('animate--up');
		} 
		else if ($(this).hasClass('animate--down')) {
			$(this).removeClass('animate--down');
		}
		
		smooshedImg.css('z-index', zIndexSmooshed);
		$(`#${spudId} .hole-content`).append(smooshedImg);
		smooshedImg.animate({opacity: 0}, 1000, function() {
			$(this).remove();
		});

		setPoints(spudPoints);		
		// console.log(totalPoints);
	});

	function setPoints(spudPoints) {
		totalPoints += spudPoints;
		if (totalPoints < 0) {
			totalPoints = 0;
		}
		$('.points').text(totalPoints + "pts");
	}
	// set animate time intervals and animate after interval complete
	function startAnimate() {
		for (var i = 0; i < activateSpuds.length; i++) {
            let time = randomNum(1000, 0);
            let spudId = activateSpuds[i];
            setTimeout(function() {
                animateSpud(spudId);
            }, time);
        }
    }

    // set spud height based on screen size
	// $(window).on('resize', setSpudHeight);
	$(window).resize(function () {
		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(function() {
			clearContainers();
			setSpudHeight();
			drawContainers(numberOfContainers);
			containerContentZIndex(containerCoords);
		}, 250);
	});

	// window.addEventListener("orientationchange", function() {
	//     // if (parseInt(screen.orientation.angle) === 90 );
	//     	isHorizontal = true;
	//     console.log('game is paused');
	// });
	// after html is loaded call js start-up functions ("restart" the game)
	restart(true);

});
