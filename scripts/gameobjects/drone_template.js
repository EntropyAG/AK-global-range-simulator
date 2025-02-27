class Drone extends GameObject {

	prevAtkIntervalTick;
	startingAtkScale;
	endingAtkScale;
	deltaAtkScale;
	currentAtkScale;
	owner; // matches the Character owning the drone
	lockedTarget; // Once a target is locked, the drone will chase that target even if another gets closer in
	// the meantime

	constructor() {
		super();
		if (this.constructor === Drone) {
		  throw new Error("Cannot instantiate abstract class [Drone].");
		}
	}
}