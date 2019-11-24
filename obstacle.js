class Obstacle {

	constructor() {
		this.width = 35;
		this.x = 0;
		
		this.heightTop = 50;
		this.yTop = 0;

		this.heightBottom = 50;
		this.yBottom = 0;
	}

	randomizeHeights(frameHeight = 480) {
		this.heightBottom = Math.floor(Math.random() * frameHeight/2);
		this.yBottom = frameHeight - this.heightBottom;

		this.heightTop = ground - this.heightBottom - 150;	
		this.yTop = 0;
	}

	move(speed = 2) {
		this.x -= speed; //+ rectangle.score * 0.5;
	}

	draw(context) {
		context.fillStyle = "#475a6d";
		context.beginPath();
		context.rect(this.x, this.yTop, this.width, this.heightTop);
		context.rect(this.x, this.yBottom, this.width, this.heightBottom);
		context.fill();
	}
}