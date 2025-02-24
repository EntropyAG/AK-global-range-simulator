class TargetDummy extends Character {

	maxHP;
	currHP;
	size = 0.3;

	constructor(id, x, y, hitpoints) {
		super();
		this.id = id;
		this.x = x;
		this.y = y;
		this.maxHP = hitpoints;
		this.currHP = hitpoints;
		this.activated = true;
	}
}