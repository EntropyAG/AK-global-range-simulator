class Character extends GameObject {

	attack;
	atkInterval;
	hitpoints;
	resistance;
	resIgnore;
	atkMult;
	aspdBuff;
	inspirationBuff; // Flat ATK buff, calculated after the atkMult

	constructor() {
		super();
		if (this.constructor === Character) {
		  throw new Error("Cannot instantiate abstract class [Character].");
		}
		this.atkMult = 0;
		this.aspdBuff = 0;
	}

	setPotential(level){
		throw new Error("Attempted to set potential, but potentials have no descriptor for this class.");
	}
}