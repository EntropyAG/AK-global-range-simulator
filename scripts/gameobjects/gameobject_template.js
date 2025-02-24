class GameObject {

	id;
	x;
	y;
	orientation = 0; // Looking right/east by default, in radians, anticlockwise
	size; // Used to check for collision only, radius

	constructor() {
		if (this.constructor === GameObject) {
		  throw new Error("Cannot instantiate abstract class [GameObject].");
		}
	}

	// ############### Positioning ###############

	// Distance between A and B is sqrt[(Bx - Ax)² + (By - Ay)²]
	getDistanceFrom(obj) {
		return Math.sqrt(Math.pow(obj.x - this.x, 2) + Math.pow(obj.y - this.y, 2));
	}

	// Returns relative angle between the centers of this and another object in ra(i)dians
	getAngleTo(obj) {
		let angle = Math.atan2(obj.y - this.y, obj.x - this.x);
		return angle < 0 ? angle + Math.PI * 2 : angle;
	}

	/**
	 * Returns relative angle between this object's orientation and another object.
	 * The result will be a value from -PI to +PI. Basically: draw a line parallel to
	 * this' orientation passing through its center, then check whether the other object
	 * is on its right (in which case the value returned will be between 0 and +PI) or if
	 * it is on its left (in which case the value returned will be between 0 and -PI)
	 */
	getAngleRelativeToOrientation(obj){
		let relativeAngle = this.getAngleTo(obj) - this.orientation;
		relativeAngle = relativeAngle % (Math.PI * 2);
		if(relativeAngle > Math.PI){
			relativeAngle -= (2 * Math.PI);
		}else if(relativeAngle < - Math.PI){
			relativeAngle += (2 * Math.PI);
		}
		return relativeAngle;
	}

	// Angle in ra(i)dians, distance in tiles (and no I won't tire of this joke)
	moveDirection(angle, distance) {
		this.x += Math.cos(angle) * distance;
		this.y += Math.sin(angle) * distance;
	}

	// Angle in ra(i)dians, anticlockwise, [ 0 ; 2*PI [
	setOrientation(angle) {
		let newOrientation = angle % (Math.PI * 2);
		if(newOrientation < 0){
			newOrientation += Math.PI * 2;
		}
		this.orientation = newOrientation;
	}

	// Returns true if this overlaps with another object
	isColliding(obj){
		return this.getDistanceFrom(obj) - (this.size + obj.size) < 0;
	}
}