//GAME DATA
$(function() {


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
			deadImg: 'img/spud--smoosh.png'
		},
		'img/martian.png': {
			points: -20,
			deadImg: 'img/martian--smoosh.png'
		},
		'img/yukon.png': {
			points: 30,
			deadImg: 'img/yukon--smoosh.png'
		},
		'img/sweet_spud.png': {
			points: 50,
			deadImg: 'img/sweet_spud--smoosh.png'
		}
	}
	//30seconds in milliseconds
	var gameTimer = 50000;
	var gameTimerId;
	var screenSize = {
		//[screen min, screen max, spud height, hole width]
		small: [0, 480,115, 200],
		medium: [480, 768, 120, 250],
		large: [768, 1170, 150, 285]
	}
	var numberOfContainers = levels.easy.numberOfContainers;
	//Default value of height if function fails to call
	var spudHeight = 150;
	//Default value of width if function fails to call
	var holeWidth = 234;
	var containerCoords = [];
	var holeHeightOffset = 40;
	var activateSpuds = [];
	var totalPoints = 0;

	//spudHeight Setter
	function setSpudHeight(){
		var windowWidth = $(this).width();

		if (screenSize.small[0] < windowWidth && windowWidth <= screenSize.small[1]) {
			spudHeight = screenSize.small[2];
			holeWidth = screenSize.small[3];

		} else if (screenSize.medium[0] < windowWidth && windowWidth <= screenSize.medium[1]) {
			spudHeight = screenSize.medium[2];
			holeWidth = screenSize.medium[3];
		} else {
			spudHeight = screenSize.large[2];
			holeWidth = screenSize.large[3];
		}
		// console.log('I am called', holeWidth);
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

	//Remove previous containers
	function removeContainers() {
		containerCoords = [];
		$('.spud-list').empty();
	}
	// draw containers, quantity is based on selected difficulty level 
	function drawContainers(numberOfContainers) {
		for (var i = 0; i < numberOfContainers; i++) {
			generateContainers(i);
		}
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


	$('.spud-list').on('click touchstart', '.hole-content__spud',function () {
		// alert('clicked');
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


    // Initialize the game screen
	setSpudHeight();
	drawContainers(numberOfContainers);
	containerContentZIndex(containerCoords);

	// Every single time the screen is changed, first debounce the event
	// Clear the existing containers
	// Re-initalize the game screen
	$(window).resize(function () {
		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(function() {
			removeContainers();
			setSpudHeight();
			drawContainers(numberOfContainers);
			containerContentZIndex(containerCoords);
		}, 250);
	});

	gameTimerId = window.setInterval(function(){
		if (gameTimer % 4000 === 0) {
			let qtyOfSpudsToActivate = ranNumOfSpudsToActivate();
			selectSpudsToActivate(qtyOfSpudsToActivate);
			startAnimate();	
		}
		activateSpuds = [];
		gameTimer-=1000;
		$('.time').text(`${gameTimer/1000}s`);
		if (gameTimer === 0) {
			console.log('cleared');
			clearInterval(gameTimerId);
		}
	},1000);
});