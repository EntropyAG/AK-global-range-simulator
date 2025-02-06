class LappyS3Drone extends Drone {

	prevAtkIntervalTick;
	aoeDotAtkScale;
	aoeDotRadius;
	initialDelay; // In seconds, delay after skill activation before wolves start chasing targets
	// For velocity/acceleration/speed, the values are related to tiles or tiles/s. Values are taken from prts.wiki
	currentSpeed;
	initialVelocity;
	initialAcceleration;
	initialMaxSpeed;
	nominalAcceleration;
	nominalMaxSpeed;
	nominalTurnRate; // 1/6 of a full rotation or PI/3 ra(i)dians
	lockedTarget; // Once a target is locked, the drone will chase that target even if another gets closer in
	  // the meantime

	constructor(owner, orientation) {
		super();
		if (owner === null || owner === undefined) {
		  throw new Error("Drones need to be linked to their caster on initialization.");
		}

		this.owner = owner;

		this.x = this.owner.x;
		this.y = this.owner.y;
		this.orientation = orientation;

		this.startingAtkScale = 0.35;
		this.currentAtkScale = this.startingAtkScale;
		this.endingAtkScale = (this.owner.alphaWolfTier >= 1) ? 1.21 : 1.1 ;
		this.deltaAtkScale = 0.15;

		// When starting a simulation, no attack has been done yet, so we just set it far in the past
		this.prevAtkIntervalTick = -9999;

		// No explosions, tho that'd be funny if the wolves could explode. Actually, there'd be hair everywhere
		// and that'd be a pain to clean everything up, nevermind then.
		this.isExploding = false;

		// AoE DoT
		this.hasAoEDot = true;
		this.aoeDotAtkScale = 1.2;
		this.aoeDotRadius = 0.9;
		this.DoTCooldown = 1.0;

		// Movement
		this.initialDelay = 1.3;
		this.initialVelocity = 0.1;
		this.initialAcceleration = 1.9;
		this.initialMaxSpeed = 2.0;
		this.nominalAcceleration = 2.0;
		this.nominalMaxSpeed = 4.0;
		this.nominalTurnRate = Math.PI / 3;
		this.postKillSpeed = 1.0;
		this.currentSpeed = this.initialVelocity;
	}

	engageSeekNDestroyRoutine(){
		// Initial delay of 1.3s where no targets are being searched
		if(akGame.tick < secToFrames(this.initialDelay)){
			this.moveDirection(this.orientation, this.currentSpeed);
			this.currentSpeed = Math.min(
				tilesPerSecToTilesPerFrame(this.initialMaxSpeed),
				tilesPerSecToTilesPerFrame(this.currentSpeed + this.initialAcceleration)
			);
			return;
		}

		let target = this.seek(akGame.dummies);
		if(!target){
			return; // The hunt is over, all targets are down, time to nap
		}

		this.chase(this.lockedTarget);
		this.attackAoE(akGame.dummies);
	}

	// Look for the closest possible target then set it as current target, if it exists
	seek(targets){
		// If our current target is alive, keep tracking that one
		if(this.lockedTarget && this.lockedTarget.currHP > 0){
			return this.lockedTarget;
		}

		// Otherwise look for one
		let closestTarget;
		for(let target of targets){
			if(!closestTarget && target.currHP > 0){
				closestTarget = target;
				continue;
			}

			if(!closestTarget){
				return;
			}

			if(this.getDistanceFrom(target) < this.getDistanceFrom(closestTarget) && target.currHP > 0){
				closestTarget = target;
			}
		}
		this.lockedTarget = closestTarget;
	}

	chase(){
		// If within range of a target, lock unto it until it dies
		if(this.getDistanceFrom(this.lockedTarget) < this.lockedTarget.size/2){
			this.currentSpeed = 0;
			this.x = this.lockedTarget.x;
			this.y = this.lockedTarget.y;
			this.attackFocused();
		}

		// Otherwise, change orientation and position to get closer
		let angleToTarget = this.getAngleTo(this.lockedTarget);
		if(Math.abs(this.orientation - angleToTarget) < this.nominalTurnRate){
			this.orientation = angleToTarget;
		}else if(this.orientation > angleToTarget){
			this.orientation -= this.nominalTurnRate;
		}else if(this.orientation < angleToTarget){
			this.orientation += this.nominalTurnRate;
		}

		this.moveDirection(this.orientation, this.currentSpeed);
		this.currentSpeed = Math.min(
			tilesPerSecToTilesPerFrame(this.initialMaxSpeed),
			tilesPerSecToTilesPerFrame(this.currentSpeed + this.initialAcceleration)
		);
	}

	attackAoE(targets){
		for(let target of targets){
			// Only hitting enemies within range, that are alive, that haven't been hit by the DoT less than 1 sec ago
			if(this.getDistanceFrom(target) > this.aoeDotRadius
					|| target.currHP <= 0
					|| Math.round(target.hitByAoEDoTFrame + secToFrames(this.DoTCooldown)) > akGame.tick
				){
				continue;
			}

			target.currHP -= Math.round(Math.max(
				this.owner.getFinalAtk() * this.aoeDotAtkScale * (1 - (this.lockedTarget.resistance/100)),
				this.owner.getFinalAtk() * this.aoeDotAtkScale * 0.05
			));

			if(this.lockedTarget.currHP <= 0){
				akGame.addCombatLog("Target dummy "+target.id+" has been killed by an AoE ATK");
			}else{
				akGame.addCombatLog("Target dummy "+target.id+"'s HP is now "
					+ target.currHP + "/" + target.maxHP+ " following an AoE DoT"
				);
			}

			target.hitByAoEDoTFrame = akGame.tick;
		}
	}

	attackFocused(){
		// We gotta respect the attack interval in this house, good sir
		if(this.prevAtkIntervalTick + secToFrames(this.owner.getFinalAtkInterval()) > akGame.tick){
			return;
		}

		this.prevAtkIntervalTick = akGame.tick;

		let finalDroneAtk = Math.round(this.owner.getFinalAtk() * this.currentAtkScale);
		// The max() is used to account for the minimum damage dealt against targets with 95 RES or higher
		let finalDamage = Math.max(
			finalDroneAtk * (1 - (this.lockedTarget.resistance/100)),
			finalDroneAtk * 0.05
		);

		this.lockedTarget.currHP -= Math.round(finalDamage);

		if(this.lockedTarget.currHP <= 0){
			akGame.addCombatLog("Target dummy "+this.lockedTarget.id+"has been killed by a focused ATK");
			// The drone is respawned randomly in a 1.5 square centered on the target
			this.x = Math.random() * 1.5 + this.lockedTarget.x - 0.75 ;
			this.y = Math.random() * 1.5 + this.lockedTarget.y - 0.75 ;
			this.currentSpeed = this.postKillSpeed;
			this.currentAtkScale = this.startingAtkScale;
		}else{
			akGame.addCombatLog("Target dummy "+this.lockedTarget.id+"'s HP is now "
				+this.lockedTarget.currHP+"/"+this.lockedTarget.maxHP+ " following a focused attack"
			);
			// On every attack, add the delta attack scale to the current scale to empower the next attacks
			this.currentAtkScale = Math.min(this.currentAtkScale + this.deltaAtkScale, this.endingAtkScale);
		}
	}
}