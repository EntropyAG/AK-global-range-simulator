const AVG_PRE_ATK_SCALE = 0.725;
const MAX_ATK_SCALE = 1.21;
const NB_ATKS_PRE = 6;
const AOE_DOT_ATK_MULT = 1.2;
const SKILL_DURATION = 40;
const INITIAL_DELAY = 1.3;

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
	focusedDamageInstances = [];
	aoeDotDamageInstances = [];
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
		"actualVsExpectedAoEDoTDpsRatio": 0,
		"actualDmgFocusedTotal": 0,
		"actualDmgAoEDoTTotal": 0,
		"actualDmgBothTotal": 0,
		"actualVsExpectedTotalDmgRatio": 0
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
			dummy.hitByAoEDoTFrame = -999;
		}
		this.resetCombatLog();
		if(this.interval){
			clearInterval(this.interval);
		}
		document.getElementById("startSimulation").classList.remove("hide");
		document.getElementById("pauseSimulation").classList.add("hide");
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
		self.lappland.atkMultBuff = parseInt(document.getElementById("atkMultBuffs").value);
		self.lappland.inspirationBuff = parseInt(document.getElementById("inspirationAtk").value);
		self.lappland.aspdBuff = parseInt(document.getElementById("aspdBuffs").value);
		self.lappland.setAlphaWolf(document.getElementById("extraDrone").checked ? 2 : 1);
		self.lappland.activateS3();
		self.isPaused = false;

		this.interval = setInterval(function(){
			if(self.isPaused){
				return;
			}

			self.calculateExpectedDps();
			self.calculateActualDps();
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
			if(!atLeast1DummyAlive || self.tick >= secToFrames(40)){
				self.endSimulation();
				console.log("No remaining targets or skill expired, ending simulation");
				return;
			}

			// Otherwise, it's time for the HUUUUUUUNT
			for(let drone of self.drones){
				drone.engageSeekNDestroyRoutine();
			}

			// Ok we done for this game tick, go to the next tick
			akGame.tick++;
			self.dpsMetrics.time = framesToSec(self.tick);

		}, 1000 / this.fps);
	}

	endSimulation(){
		this.isPaused = true;
		setFieldsetsInteractable(true);
	}

	resetCombatLog(){
		this.logs = [];
		this.focusedDamageInstances = [];
		this.aoeDotDamageInstances = [];
	}

	calculateActualDps(){
		if(this.dpsMetrics.time === 0){
			return;
		}

		let sumFocused = this.focusedDamageInstances.reduce(function (x, y) {
			return x + y;
		}, 0);
		let sumAoeDot = this.aoeDotDamageInstances.reduce(function (x, y) {
			return x + y;
		}, 0);

		this.dpsMetrics.actualDmgFocusedTotal = sumFocused;
		this.dpsMetrics.actualDmgAoEDoTTotal = sumAoeDot;
		this.dpsMetrics.actualDmgBothTotal = sumFocused + sumAoeDot;

		this.dpsMetrics.actualDpsFocused = sumFocused / this.dpsMetrics.time;
		this.dpsMetrics.actualDpsAoEDoT = sumAoeDot / this.dpsMetrics.time;
		this.dpsMetrics.actualVsExpectedFocusedDpsRatio =
			this.dpsMetrics.actualDpsFocused / this.dpsMetrics.expectedDpsFocused * 100;
		this.dpsMetrics.actualVsExpectedAoEDoTDpsRatio =
			this.dpsMetrics.actualDpsAoEDoT / this.dpsMetrics.expectedDpsAoEDoT * 100;
		this.dpsMetrics.actualVsExpectedTotalDmgRatio =
			(sumFocused + sumAoeDot) / this.dpsMetrics.expectedTotalDmgBoth * 100;
	}

	/**
	 * Based on the same formulas as the spreadsheet, when in doubt use it directly
	 */
	calculateExpectedDps(){
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
		// Because we can't expect to do damage during the initial delay (1.3s)
		let expectedTotalDmgFocused = Math.max(expectedDpsFocused * (this.dpsMetrics.time - INITIAL_DELAY), 0);
		let expectedTotalDmgAoEDoT = expectedDpsAoEDoT * this.dpsMetrics.time;
		let expectedTotalDmgBoth = expectedTotalDmgFocused + expectedTotalDmgAoEDoT;

		this.dpsMetrics.expectedDpsBoth = expectedDpsBoth;
		this.dpsMetrics.expectedDpsAoEDoT = expectedDpsAoEDoT;
		this.dpsMetrics.expectedDpsFocused = expectedDpsFocused;
		this.dpsMetrics.expectedTotalDmgFocused = expectedTotalDmgFocused;
		this.dpsMetrics.expectedTotalDmgAoEDoT = expectedTotalDmgAoEDoT;
		this.dpsMetrics.expectedTotalDmgBoth = expectedTotalDmgBoth;
	}
}

let akGame = new Game();