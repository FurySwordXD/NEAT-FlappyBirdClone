var context = document.querySelector("canvas").getContext("2d");

const screenWidth = 350;
const screenHeight = 500;
const ground = 480;
let paused = false;
let playRate = 1;

context.canvas.width = screenWidth;
context.canvas.height = screenHeight;

var currentObstacleIndex = 0;
const minObstacleDistance = screenWidth/1.5;

var highScore = 0;
var score = 0;

var rectangles = [];
var savedRectangles = [];
var obstacles = [];

let populationSize = 100;

function init() {
	//populationSize = Number(prompt("Enter the max population size per generation"));
	for (var i = 0; i < populationSize; i++)
		rectangles.push(new Rectangle());

	drawDebugNeuralNet(rectangles[0].brain);
	var obstacle = new Obstacle();
	obstacle.x = screenWidth;
	obstacle.randomizeHeights();
	obstacles.push(obstacle);
	for (var i = 0; i < 2;  i++) {
		createObstacle();
	}

	window.requestAnimationFrame(mainLoop);
}

function mainLoop() {
	if (!paused)
	{
		for (var p = 0; p < playRate; p++)
		{
			for (var i = 0; i < rectangles.length; i++)
				rectangles[i].think(obstacles[currentObstacleIndex]);
			
			update();
			
			if (rectangles.length == 0)
			{
				nextGeneration();
				score = 0;
				obstacles = []
				var obstacle = new Obstacle();
				obstacle.x = screenWidth;
				obstacle.randomizeHeights();
				obstacles.push(obstacle);
				for (var i = 0; i < 2;  i++) {
					createObstacle();
				}
			}
		}	
		drawing();
	}
	window.requestAnimationFrame(mainLoop);
};

function createObstacle() {
	var obstacle = new Obstacle();
	obstacle.x = obstacles[obstacles.length - 1].x + minObstacleDistance + score * 5;
	obstacle.randomizeHeights();
	obstacles.push(obstacle);
}

function update() {

	for (var i = 0; i < obstacles.length; i++)
	{
		obstacles[i].move(2 + score /5);
		if (obstacles[i].x < -obstacles[i].width) // out of screen
		{
			obstacles.splice(i, 1);
			currentObstacleIndex = 0;
			createObstacle();
		}
	}
	
	var flag = false;
	for (var i = 0; i < rectangles.length; i++)
	{
		rectangles[i].update();
		//rectangles[i].score++;
		var obstacle = obstacles[currentObstacleIndex];
		var obstacleTop = {x: obstacle.x, y: obstacle.yTop, width: obstacle.width, height: obstacle.heightTop};
		var obstacleBottom = {x: obstacle.x, y: obstacle.yBottom, width: obstacle.width, height: obstacle.heightBottom};
		if(!rectangles[i].checkCollision([obstacleTop, obstacleBottom]))
		{
			if (obstacle.x + obstacle.width/2 < rectangles[i].x)
			{
				rectangles[i].score += 1;
				flag = true;
			}
		}
		else
		{
			let popped = rectangles.splice(i, 1)[0];
			savedRectangles.push(popped);
		}
			
	}
	if (flag)
		currentObstacleIndex += 1;
}


function drawing() {

	context.fillStyle = "#202020";
	context.fillRect(0, 0, screenWidth, screenHeight);// x, y, width, height

	for (var i = 0; i < obstacles.length;  i++)
		obstacles[i].draw(context);

	for (var i = 0; i < rectangles.length; i++)
	{
		if (score < rectangles[i].score)
		{
			score = rectangles[i].score;
			if (highScore < score)
				highScore = score;
		}
		rectangles[i].draw(context);
	}

	context.strokeStyle = "#475a6d";
	context.lineWidth = 4;
	context.beginPath();
	context.moveTo(0, ground);
	context.lineTo(screenWidth, ground);
	context.stroke();

	document.getElementById("specimen").innerHTML = rectangles.length;
	document.getElementById("score").innerHTML = score;
	document.getElementById("highScore").innerHTML = highScore;
}

document.addEventListener("DOMContentLoaded", function(event) { 
    init();
});

document.getElementById("playRate").addEventListener("change", function(event) {
	playRate = this.value;
	document.getElementById("playRateText").innerHTML = this.value;
});