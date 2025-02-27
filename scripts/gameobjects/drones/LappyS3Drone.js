class LappyS3Drone extends Drone {

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

	constructor(owner, orientation) {
		super();
		if (owner === null || owner === undefined) {
		  throw new Error("Drones need to be linked to their caster on initialization.");
		}

		this.owner = owner;

		this.x = this.owner.x;
		this.y = this.owner.y;
		this.setOrientation(orientation);

		this.startingAtkScale = 0.35;
		this.currentAtkScale = this.startingAtkScale;
		this.endingAtkScale = (this.owner.alphaWolfTier >= 1) ? 1.21 : 1.1 ;
		this.deltaAtkScale = 0.15;

		// When starting a simulation, no attack has been done yet, so we just set it far in the past
		this.prevAtkIntervalTick = -9999;

		// AoE DoT
		this.aoeDotAtkScale = 1.2;
		this.aoeDotRadius = 0.9;
		this.DoTCooldown = 1.0;

		// Movement
		this.initialDelay = 1.3; // sec
		this.initialVelocity = 0.1; // Tiles/sec
		this.initialAcceleration = 1.9; // Tiles/sec²
		this.initialMaxSpeed = 2.0; // Tiles/sec
		this.nominalAcceleration = 2.0; // Per sec
		this.nominalMaxSpeed = 4.0; // Tiles/sec
		this.nominalTurnRate = Math.PI / 3; // Per frame
		this.postKillSpeed = 1.0; // Tiles/sec
		this.currentSpeed = this.initialVelocity; // Tiles/sec
	}

	engageSeekNDestroyRoutine(){
		// The AoE happens at all time, even during the initial phase
		this.attackAoE(akGame.dummies);

		// Initial delay of 1.3s where no targets are being searched
		if(akGame.tick < secToFrames(this.initialDelay)){
			this.moveDirection(this.orientation, tilesPerSecToTilesPerFrame(this.currentSpeed));
			this.currentSpeed = Math.min(
				this.initialMaxSpeed,
				this.currentSpeed + tilesPerSecToTilesPerFrame(this.initialAcceleration)
			);
			return;
		}

		// We were locked into a target who died, respawn near it
		if(this.lockedTarget && this.lockedTarget.currHP <= 0){
			this.currentSpeed = this.postKillSpeed;
			this.currentAtkScale = this.startingAtkScale;
			// Respawn in a square of size 1.5 tiles centered on the target after it dies,
			// but only if we were stacked with it (dealing focused damage)
			if(this.x === this.lockedTarget.x && this.y === this.lockedTarget.y){
				this.x = Math.random() * 1.5 + this.lockedTarget.x - 0.75 ;
				this.y = Math.random() * 1.5 + this.lockedTarget.y - 0.75 ;
			}
		}

		// If there is no target locked (or they are dead) seek a new one
		if(!this.lockedTarget || this.lockedTarget.currHP <= 0){
			this.lockedTarget = this.seek(akGame.dummies);
		}

		if(this.lockedTarget){
			this.chase(this.lockedTarget);
		}
	}

	// Look for the closest possible target then set it as current target, if it exists
	seek(targets){
		let closestTarget;
		for(let target of targets){
			if(target.currHP <= 0 || target.activated === false){
				continue;
			}else if(!closestTarget){
				closestTarget = target;
			}else if(this.getDistanceFrom(target) < this.getDistanceFrom(closestTarget) && target.currHP > 0){
				closestTarget = target;
			}
		}
		return closestTarget;
	}

	chase(){
		// If within range of a target, lock unto it until it dies
		if(this.getDistanceFrom(this.lockedTarget) < this.lockedTarget.size/2){
			this.currentSpeed = 0;
			this.x = this.lockedTarget.x;
			this.y = this.lockedTarget.y;
			this.attackFocused();
			return;
		}

		// Otherwise, change orientation and position to get closer
		// For orientation, because it's a value from [0;2*PI[
		// we check the relative angle compared to the direction the drone is facing
		// so that we know in which direction to turn
		let angleToTarget = this.getAngleTo(this.lockedTarget);
		let relativeAngle = this.getAngleRelativeToOrientation(this.lockedTarget);
		if(Math.abs(relativeAngle) <= this.nominalTurnRate){
			this.setOrientation(angleToTarget);
		}else if(relativeAngle > this.nominalTurnRate){
			this.setOrientation(this.orientation + this.nominalTurnRate);
		}else if(relativeAngle < this.nominalTurnRate){
			this.setOrientation(this.orientation - this.nominalTurnRate);
		}
		this.moveDirection(this.orientation, tilesPerSecToTilesPerFrame(this.currentSpeed));
		this.currentSpeed = Math.min(
			this.nominalMaxSpeed,
			this.currentSpeed + tilesPerSecToTilesPerFrame(this.nominalAcceleration)
		);
	}

	attackAoE(targets){
		for(let target of targets){
			// Only hitting enemies within range, that are alive, that haven't been hit by the DoT less than 1 sec ago
			if(this.getDistanceFrom(target) > this.aoeDotRadius
					|| target.currHP <= 0
					|| target.activated === false
					|| Math.round(target.hitByAoEDoTFrame + secToFrames(this.DoTCooldown)) > akGame.tick
				){
				continue;
			}

			let finalDamage = Math.round(this.owner.getFinalAtk() * this.aoeDotAtkScale);

			target.currHP -= finalDamage;

			// We don't want to record any overkill damage, so we remove any part that drops below 0
			let finalRecordedDmg = target.currHP < 0 ? finalDamage + target.currHP : finalDamage;
			akGame.aoeDotDamageInstances.push(finalRecordedDmg);
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

		this.lockedTarget.currHP -= finalDroneAtk;

		// We don't want to record any overkill damage, so we remove any part that drops below 0
		let finalRecordedDmg = this.lockedTarget.currHP < 0 ? finalDroneAtk + this.lockedTarget.currHP : finalDroneAtk;
		akGame.focusedDamageInstances.push(finalRecordedDmg);

		if(this.lockedTarget.currHP > 0){
			// On every attack, add the delta attack scale to the current scale to empower the next attacks
			this.currentAtkScale = Math.min(this.currentAtkScale + this.deltaAtkScale, this.endingAtkScale);
		}
	}
}