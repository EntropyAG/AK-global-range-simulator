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
		// Just to make entities have a somewhat unique ID.
		// "But there might be collisions :( :( :("
		// Ya ya, whatever, it's just in the logs...
		this.id = Math.round(Math.random() * 10000000);
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