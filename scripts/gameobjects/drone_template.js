class Drone extends GameObject {

	startingAtkScale;
	endingAtkScale;
	deltaAtkScale;
	currentAtkScale;
	owner; // matches the Character owning the drone
	hasAoEDot; // true if it has an AoE aura surrounding the drone

	constructor() {
		super();
		if (this.constructor === Drone) {
		  throw new Error("Cannot instantiate abstract class [Drone].");
		}
	}
}