class TargetDummy extends Character {

	maxHP;
	currHP;
	size = 0.3;

	constructor(id, x, y, hitpoints, res) {
		super();
		this.id = id;
		this.x = x;
		this.y = y;
		this.maxHP = hitpoints;
		this.currHP = hitpoints;
		this.resistance = res;
		this.activated = true;
	}
}