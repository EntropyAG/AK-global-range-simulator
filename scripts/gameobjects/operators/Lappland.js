class Lappland extends Character {

	isS3Enabled;
	alphaWolfTier;
	isSiracusanPleasureEnabled; // 10 ASPD on first skill activation. Like, just let it on.

	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this.atkInterval = 1.3;
		this.isSiracusanPleasureEnabled = true;
		this.isS3Enabled = false;
		this.atkMult = 0;
		this.atkMultBuff = 0;
		this.aspdBuff = 0;
		this.inspirationBuff = 0;
		this.setPotential(0);
		this.setAlphaWolf(2);
	}

	/**
	 * Combat-wise, Lappy truly got the shorter end of the stick. Only one potential (pot 3) providing any kind
	 * of buff once you got the Alpha Wolf talent maxed out? All that while Goldenglow gets no less than 3 different
	 * upgrades. Like, what the heck.
	 * @param {Integer} level: the potential level to set
	 */
	setPotential(level){
		if(level < 0 || level > 5){
			throw new Error("Don't you think it's weird that it's called potential? Like, imagine going all "
			+"'Oh yeah, you are lacking potential' to an operator. ");
		}

		if(level >= 3){
			this.attack = 460;
		}else{
			this.attack = 435;
		}
	}

	/**
	 * @param {Integer} tier: 0 = no buffs, 1 = +10% drone max ATK scale (multiplicative), 2 = additional drone
	 */
	setAlphaWolf(tier){
		if(tier < 0 || tier > 2){
			throw new Error("Did you know that all the Alpha/Sigma/Whatever wolf thing is actually BS? Yup, "
			+"even the guy that came up with it also realized his work was trash, yet we still have a bunch "
			+"of peeps on the Internet taking it as the absolute truth of society.");
		}

		this.alphaWolfTier = tier;
	}

	activateS3(){
		let self = this;
		this.isS3Enabled = true;
		this.atkMult = 0.8;
		/**
		 * On skill activation, drones are summoned depending on how many there are. For the angles stated below,
		 * we assume [0;PI*2[ clockwise
		 * If there are 4, they each go in a primary cardinal direction, or 0, PI/2, PI and PI*3/4.
		 * If there are 3, they go to PI*3/6, PI*7/6 and PI*11/6
		 */
		let droneCount = this.getDroneCount();
		let startingAngle = droneCount === 4 ? 0 : Math.PI * 1/2;
		let deltaAngle = 2 * Math.PI / droneCount;
		for(let i=0; i<droneCount; i++){
			akGame.drones.push(
				new LappyS3Drone(self, startingAngle + deltaAngle * i)
			);
		}
	}

	getDroneCount(){
		let baseCount = this.alphaWolfTier === 2 ? 2 : 1;
		let extraDrones = this.isS3Enabled ? 2 : 0;
		return baseCount + extraDrones;
	}

	/**
	 * Returns the final attack interval, taking into account ASPD buffs as well as frame rounding.
	 * ASPD is capped at 600 (taking into account the base 100 ASPD)
	 */
	getFinalAtkInterval(){
		let aspdFromTalent = this.isSiracusanPleasureEnabled ? 10 : 0;
		return roundTo(
			roundTo(
				this.atkInterval/(Math.min(100 + aspdFromTalent + this.aspdBuff, 600)/100)*akGame.fps)/akGame.fps,
				4
		);
	}

	getFinalAtk(){
		return Math.round((this.attack * (1 + this.atkMult + this.atkMultBuff / 100)) + this.inspirationBuff);
	}
}