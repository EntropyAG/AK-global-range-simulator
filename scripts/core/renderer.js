const SCALES = {
	LAPPLAND: 0.9,
	DUMMY: 0.5,
	DRONE: 0.5
};

const SPRITES = {
	LAPPLAND:   { X: 0, Y: 0, WIDTH: 279, HEIGHT: 279 },
	DUMMY:      { X: 279, Y: 0, WIDTH: 279, HEIGHT: 279 },
	DUMMY_DEAD: { X: 279, Y: 279, WIDTH: 279, HEIGHT: 279 },
	DRONE:      { X: 0, Y: 279, WIDTH: 279, HEIGHT: 279 },
};

class Renderer {
	canvas;
	ctx;
	observer;
	width = 300;
	height = 150;
	lastTickRendered;

	constructor() {
		if (Renderer._instance) {
			return Renderer._instance;
		}
		Renderer._instance = this;
		this.canvas = document.getElementById("game");
		this.ctx = this.canvas.getContext("2d");
		this.lastTickRendered = -1;
	}

	getScaleFactor(){
		return this.canvas.width / akGame.tilesX;
	}

	getBoundedScaleFactor(){
		return this.canvas.getBoundingClientRect().width / akGame.tilesX;
	}

	getDummySize(){
		return SCALES.DUMMY * akRenderer.canvas.getBoundingClientRect().width / akGame.tilesX;
	}

	getLappySize(){
		return SCALES.LAPPLAND * akRenderer.canvas.getBoundingClientRect().width / akGame.tilesX;
	}

	getGameObjectCanvasPos(obj){
		return {
			x: obj.x * akRenderer.canvas.getBoundingClientRect().width / akGame.tilesX,
			y: obj.y * akRenderer.canvas.getBoundingClientRect().height / akGame.tilesY
		};
	}

	display(){
		// Used to not unnecessarily refresh if the tick has not progressed
		if(akGame.isPaused === false && akRenderer.lastTickRendered === akGame.tick){
			requestAnimationFrame(akRenderer.display);
			return;
		}

		akRenderer.lastTickRendered = akGame.tick;

		// Fix for resolution issues, otherwise things are super pixelated
		akRenderer.ctx.canvas.width  = document.getElementsByClassName("content")[0].clientWidth;
		akRenderer.ctx.canvas.height = document.getElementsByClassName("content")[0].clientHeight;

		// Draw the Background first
		akRenderer.ctx.fillRect(0,0, akRenderer.canvas.width, akRenderer.canvas.height);
		let scaleFactor = akRenderer.getScaleFactor();
		akRenderer.canvas.height = akGame.tilesY * scaleFactor;
		for(let x=0; x<akGame.tilesX; x++){
			for(let y=0; y<akGame.tilesY; y++){
				akRenderer.ctx.fillStyle = "rgb(150,255,150)";
				akRenderer.ctx.fillRect(
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
		akRenderer.ctx.drawImage(img,
			SPRITES.LAPPLAND.X, SPRITES.LAPPLAND.Y, // src image pos
			SPRITES.LAPPLAND.WIDTH, SPRITES.LAPPLAND.HEIGHT, // src image size
			(lappy.x - SCALES.LAPPLAND / 2) * scaleFactor, (lappy.y - SCALES.LAPPLAND / 2) * scaleFactor, // pos in canvas
			SCALES.LAPPLAND * scaleFactor, SCALES.LAPPLAND * scaleFactor // size in canvas
		);

		// Then the wolves
		let drones = akGame.drones;
		for(let drone of drones){
			akRenderer.ctx.drawImage(img,
				SPRITES.DRONE.X, SPRITES.DRONE.Y, // src image pos
				SPRITES.DRONE.WIDTH, SPRITES.DRONE.HEIGHT, // src image size
				(drone.x - SCALES.DRONE / 2) * scaleFactor, (drone.y - SCALES.DRONE / 2) * scaleFactor, // pos in canvas
				SCALES.DRONE * scaleFactor, SCALES.DRONE * scaleFactor // size in canvas
			);
		}

		// Then the target dummies
		let dummies = akGame.dummies.filter(e => e.activated === true);
		akRenderer.ctx.fillStyle = "rgb(0,0,0)";
		for(let dummy of dummies){
			akRenderer.ctx.drawImage(img,
				// src image pos, ternary to pick between 2 different sprites
				dummy.currHP > 0 ? SPRITES.DUMMY.X : SPRITES.DUMMY_DEAD.X,
				dummy.currHP > 0 ? SPRITES.DUMMY.Y : SPRITES.DUMMY_DEAD.Y,
				// src image size
				dummy.currHP > 0 ? SPRITES.DUMMY.WIDTH : SPRITES.DUMMY_DEAD.HEIGHT,
				dummy.currHP > 0 ? SPRITES.DUMMY.WIDTH : SPRITES.DUMMY_DEAD.HEIGHT,
				(dummy.x - SCALES.DUMMY / 2) * scaleFactor, (dummy.y - SCALES.DUMMY / 2) * scaleFactor, // pos in canvas
				SCALES.DUMMY * scaleFactor, SCALES.DUMMY * scaleFactor // size in canvas
			);
			akRenderer.ctx.font = "24px Arial";
			akRenderer.ctx.fillStyle = "rgb(0,0,0)";
			akRenderer.ctx.fillText(
				"HP "+dummy.currHP,
				(dummy.x - SCALES.DUMMY / 2) * scaleFactor,
				(dummy.y - 0.25) * scaleFactor
			);
			akRenderer.ctx.fillStyle = "rgb(255,255,255)";
			akRenderer.ctx.fillText(
				"ID "+dummy.id,
				(dummy.x - SCALES.DUMMY / 2) * scaleFactor,
				(0.20 + dummy.y) * scaleFactor
			);
		}
		requestAnimationFrame(akRenderer.display);
	}
}

let akRenderer = new Renderer();