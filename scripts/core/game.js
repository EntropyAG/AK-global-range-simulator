class Game {
	isPaused = true;
	interval;
	tick = 0;
	fps = 30;
	lappland;
	drones = [];
	dummies = [];
	dummyMaxIndex = 0;
	logs = [];
	dpsMetrics = {
		"time": 0,
		"expectedFocused": 0,
		"expectedAoEDoT": 0,
		"actualFocused": 0,
		"actualAoEDoT": 0,
		"actualVsExpectedFocused%": 0,
		"actualVsExpectedAoEDoT%": 0
	};
	tilesX; // Number of tiles in the X axis
	tilesY; // Number of tiles in the Y axis

	constructor(){
		if (Game._instance) {
			return Game._instance;
		}
		Game._instance = this;
		this.tilesX = 15;
		this.tilesY = 9;
	}

	resetSimulation() {
		this.isPaused = true;
		this.tick = 0;
		this.drones = [];
		for(let dummy of this.dummies){
			dummy.currHP = dummy.maxHP;
		}
		this.resetCombatLog();
		if(this.interval){
			clearInterval(this.interval);
		}
		document.getElementById("startSimulation").classList.remove("hide");
		document.getElementById("pauseSimulation").classList.add("hide");
		akRenderer.display(self);
		setFieldsetsInteractable(true);
	}

	pauseSimulation(){
		this.isPaused = !this.isPaused;
	}

	startSimulation(){
		setFieldsetsInteractable(false);
		let self = this;
		document.getElementById("startSimulation").classList.add("hide");
		document.getElementById("pauseSimulation").classList.remove("hide");
		this.isPaused = false;
		this.lappland.activateS3();

		// TODO precalculate expected DPS

		this.interval = setInterval(function(){
			if(self.isPaused){
				return;
			}

			// Check if there are remaining targets
			let atLeast1DummyAlive = false;
			for(let dummy of self.dummies){
				if(dummy.currHP > 0){
					atLeast1DummyAlive = true;
					break;
				}
			}

			// If not, we're done
			if(!atLeast1DummyAlive){
				self.endSimulation();
				console.log("No remaining targets, ending simulation");
			}

			// Otherwise, it's time for the HUUUUUUUNT
			for(let drone of self.drones){
				drone.engageSeekNDestroyRoutine();
			}

			// Ok we done for this game tick, go to the next tick
			akRenderer.display();
			akGame.tick++;

		}, 1000 / this.fps);
	}

	endSimulation(){
		this.isPaused = true;
		setFieldsetsInteractable(true);
	}

	addCombatLog(str){
		this.logs.push(str);
		console.log("Frame "+this.tick+" received: "+str);
	}

	resetCombatLog(){
		this.logs = [];
	}
}

let akGame = new Game();