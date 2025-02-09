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
		"expectedTotalDmgFocused": 0,
		"expectedTotalDmgAoEDoT": 0,
		"expectedTotalDmgBoth": 0,
		"expectedDpsFocused": 0,
		"expectedDpsAoEDoT": 0,
		"expectedDpsBoth": 0,
		"actualDpsFocused": 0,
		"actualDpsAoEDoT": 0,
		"actualVsExpectedFocusedDpsRatio": 0,
		"actualVsExpectedAoEDoTDpsRatio": 0
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

		self.calculateExpectedDps();

		this.interval = setInterval(function(){
			if(self.isPaused){
				return;
			}

			updateDisplayedMetrics();

			// Check if there are remaining targets
			let atLeast1DummyAlive = false;
			for(let dummy of self.dummies){
				if(dummy.currHP > 0 && dummy.activated === true){
					atLeast1DummyAlive = true;
					break;
				}
			}

			// If enemies are dead or the skill expires, we forcefully end the simulation
			if(!atLeast1DummyAlive || this.tick >= secToFrames(40)){
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

	/**
	 * Based on the same formulas as the spreadsheet, when in doubt use it directly
	 */
	calculateExpectedDps(){
		const AVG_PRE_ATK_SCALE = 0.725;
		const MAX_ATK_SCALE = 1.21;
		const NB_ATKS_PRE = 6;
		const AOE_DOT_ATK_MULT = 1.2;
		const SKILL_DURATION = 40;
		const INITIAL_DELAY = 1.3;
		let finalAtk = this.lappland.getFinalAtk();
		let finalAtkInterval = this.lappland.getFinalAtkInterval();
		let droneCount = this.lappland.getDroneCount();

		// Doesn't take the AoE DoT into account
		let preDroneDps = (droneCount*AVG_PRE_ATK_SCALE*finalAtk/finalAtkInterval);
		let pstDroneDps = (droneCount*MAX_ATK_SCALE*finalAtk/finalAtkInterval);

		let warmupTime = finalAtkInterval * NB_ATKS_PRE;
		let pstDuration = SKILL_DURATION - INITIAL_DELAY - warmupTime;


		let expectedDpsFocused = (pstDroneDps * pstDuration + preDroneDps * warmupTime) / SKILL_DURATION;
		let expectedDpsAoEDoT = finalAtk*AOE_DOT_ATK_MULT;
		let expectedDpsBoth = expectedDpsAoEDoT + expectedDpsFocused;
		let expectedTotalDmgFocused = expectedDpsFocused * SKILL_DURATION;
		let expectedTotalDmgAoEDoT = expectedDpsAoEDoT * SKILL_DURATION;
		let expectedTotalDmgBoth = expectedTotalDmgFocused + expectedTotalDmgAoEDoT;

		this.dpsMetrics.time = 0;
		this.dpsMetrics.expectedDpsBoth = expectedDpsBoth;
		this.dpsMetrics.expectedDpsAoEDoT = expectedDpsAoEDoT;
		this.dpsMetrics.expectedDpsFocused = expectedDpsFocused;
		this.dpsMetrics.expectedTotalDmgFocused = expectedTotalDmgFocused;
		this.dpsMetrics.expectedTotalDmgAoEDoT = expectedTotalDmgAoEDoT;
		this.dpsMetrics.expectedTotalDmgBoth = expectedTotalDmgBoth;
	}
}

let akGame = new Game();