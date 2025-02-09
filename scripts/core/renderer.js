class Renderer {
	canvas;
	ctx;

	constructor() {
		if (Renderer._instance) {
			return Renderer._instance;
		}
		Renderer._instance = this;
		this.canvas = document.getElementById("game");
		this.ctx = this.canvas.getContext("2d");
	}

	display(){
		this.ctx.canvas.width  = window.innerWidth;
  		this.ctx.canvas.height = window.innerHeight;
		  // Draw the Background first
		this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
		let scaleFactor = this.canvas.width / akGame.tilesX;
		this.canvas.height = akGame.tilesY * scaleFactor;
		for(let x=0; x<akGame.tilesX; x++){
			for(let y=0; y<akGame.tilesY; y++){
				this.ctx.fillStyle = "rgb(150,255,150)";
				this.ctx.fillRect(
					(0.05 + x) * scaleFactor, // Position X
					(0.05 + y) * scaleFactor, // Position Y
					0.9 * scaleFactor, // Width
					0.9 * scaleFactor // Height
				);
			}
		}

		let img = document.getElementById("sprites");

		// Then lappland
		let lappy = akGame.lappland;
		this.ctx.drawImage(img,
			0, 0, // src image pos
			279, 279, // src image size
			(0.05 + lappy.x) * scaleFactor, (0.05 + lappy.y) * scaleFactor, // pos in canvas
			0.9 * scaleFactor, 0.9 * scaleFactor // size in canvas
		);

		// Then the wolves
		let drones = akGame.drones;
		for(let drone of drones){
			this.ctx.drawImage(img,
				0, 279, // src image pos
				279, 279, // src image size
				(0.25 + drone.x) * scaleFactor, (0.25 + drone.y) * scaleFactor, // pos in canvas
				0.5 * scaleFactor, 0.5 * scaleFactor // size in canvas
			);
		}

		// Then the target dummies
		let dummies = akGame.dummies.filter(e => e.activated === true);
		this.ctx.fillStyle = "rgb(0,0,0)";
		for(let dummy of dummies){
			this.ctx.drawImage(img,
				279, dummy.currHP > 0 ? 0 : 279, // src image pos, ternary to pick between 2 different sprites
				279, 279, // src image size
				(0.25 + dummy.x) * scaleFactor, (0.25 + dummy.y) * scaleFactor, // pos in canvas
				0.5 * scaleFactor, 0.5 * scaleFactor // size in canvas
			);
			this.ctx.font = "24px Arial";
			this.ctx.fillStyle = "rgb(0,0,0)";
			this.ctx.fillText(
				"HP "+dummy.currHP,
				(0.25 + dummy.x) * scaleFactor,
				(0.25 + dummy.y) * scaleFactor
			);
			this.ctx.font = "24px Arial";
			this.ctx.fillStyle = "rgb(40,40,255)";
			this.ctx.fillText(
				"RES "+dummy.resistance,
				(0.25 + dummy.x) * scaleFactor,
				(0.05 + dummy.y) * scaleFactor
			);
		}
	}
}

let akRenderer = new Renderer();