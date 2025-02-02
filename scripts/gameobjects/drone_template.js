class Drone extends GameObject {

	startingAtkScale;
	endingAtkScale;
	deltaAtkScale;
	currentAtkScale;
	owner; // matches the Character owning the drone
	isExploding; // true if has a % chance of exploding
	hasAoEDot; // true if it has an AoE aura surrounding the drone

	constructor() {
		super();
		if (this.constructor === Drone) {
		  throw new Error("Cannot instantiate abstract class [Drone].");
		}
	}
}