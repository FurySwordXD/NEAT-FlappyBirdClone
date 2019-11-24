class Rectangle {

	constructor(genome)
	{
		this.height = 32;
		this.jumping = false;
		this.jumpHeight = 15;
		this.width = 32;
		this.x = 50; // center of the canvas
		this.x_velocity = 0;
		this.y = 200;
		this.y_velocity = 0;
		this.max_y_velocity = 10;
		this.score = 0.0;
		this.fitness = 0.0;
		
		if (genome)
		{
			this.brain = genome;
		}
		else
		{
			this.brain = new Genome(4, 2);

			// this.brain.addNode(new Node("INPUT", 1));
			// this.brain.addNode(new Node("INPUT", 2));
			// this.brain.addNode(new Node("INPUT", 3));
			// this.brain.addNode(new Node("INPUT", 4));

			// this.brain.addNode(new Node("OUTPUT", 5));
			// this.brain.addNode(new Node("OUTPUT", 6));
		}

		this.controller = {
			keyDown:function(event) {
				switch(event.keyCode) {
					case 27: // Esc
						paused = !paused;
						break;
					case 32:
						this.jump();
						break;
				}
			},
		};

		window.addEventListener("keydown", this.controller.keyDown);
	}

	jump() {
		if (!this.jumping)
		{
			this.y_velocity -= this.jumpHeight;
			this.jumping = true;
			setTimeout(this.stopJump(), 200);
		}
	}

	stopJump() {
		this.jumping = false;
	}

	checkCollision(obstacles) {
		for (var i = 0; i < obstacles.length; i++)
		{
			var obstacle = obstacles[i];
			if ((this.x < obstacle.x + obstacle.width &&  
				this.x + this.width > obstacle.x) &&
				(this.y + this.height > obstacle.y &&
				this.y < obstacle.y + obstacle.height))
			{
				return true;
			}
		}
		
		return false;
	}

	update() {
		this.physics();
	}

	physics() {
		this.y_velocity += 0.5;// gravity

		if (Math.abs(this.y_velocity) > this.max_y_velocity)
		{
			this.y_velocity = (this.y_velocity > 0) ? this.max_y_velocity : -this.max_y_velocity;
		}
		
		this.x += this.x_velocity;
		this.y += this.y_velocity;

		this.y_velocity *= 0.95;
		// if rectangle is falling below floor line
		if (this.y + this.height > ground) {
			this.y = ground - this.height;
			this.y_velocity = 0;
		}
		// rectangle above canvas
		if (this.y < 0) {
			this.y = 0;
			this.y_velocity = 0;
		}
	}
	
	draw(context) {
		context.fillStyle = "#ff0000";// hex for red
		context.beginPath();
		context.rect(this.x, this.y, this.width, this.height);
		context.fill();
	}

	think(obstacle) {
		let inputs = [	this.y / screenHeight, 
			obstacle.yBottom / screenHeight, 
			obstacle.yTop + obstacle.heightTop / screenHeight,
			obstacle.x / screenWidth	];
		
		let output = this.brain.predict(inputs);
		let threshold = 0.5;
		//console.log(output[0], output[1]);
		if (output[0] > output[1])
			this.jump();
		
		
		// this.brain.predict(inputs).then(output => {
		// 	if (output[0] > output[1])
		// 		this.jump();
		// });
	}
};

