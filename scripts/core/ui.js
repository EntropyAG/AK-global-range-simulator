/**
 * The following listeners are executed on script load, since they apply to
 * elements that are not removed/added
 */

// Lappland section

document.getElementById("extraDrone").addEventListener("click", (e) => {
    akGame.lappland.setAlphaWolf(e.target.checked ? 2 : 1);
});

document.getElementById("lappyPosX").addEventListener("input", (e) => {
    akGame.lappland.x = parseInt(e.target.value);
    akRenderer.display();
});

document.getElementById("lappyPosY").addEventListener("input", (e) => {
    akGame.lappland.y = parseInt(e.target.value);
    akRenderer.display();
});

document.getElementById("inspirationAtk").addEventListener("input", (e) => {
    akGame.lappland.inspirationBuff = e.target.value;
});

document.getElementById("atkMultBuffs").addEventListener("input", (e) => {
    akGame.lappland.atkMultBuff = e.target.value;
});

document.getElementById("aspdBuffs").addEventListener("input", (e) => {
    akGame.lappland.aspdBuff = e.target.value;
});

// Target dummies

document.getElementById("addDummy").addEventListener("click", (e) => {
    addNewTargetDummySection();
    akGame.dummies.push(new TargetDummy(5, 5, 10000, 0));
    akRenderer.display();
});


// Simulation control

document.getElementById("startSimulation").addEventListener("click", (e) => {
    akGame.startSimulation();
});

document.getElementById("pauseSimulation").addEventListener("click", (e) => {
    akGame.pauseSimulation();
});

document.getElementById("resetSimulation").addEventListener("click", (e) => {
    akGame.resetSimulation();
});

/**
 * Target HTML to be generated (behaviors added near the end) below. In the example given,
 * the target index is 1.
 * 	<fieldset id="targetDummy1">
 *		<legend>Target Dummy 1</legend>
 *		<label for="maxHP">Max HP</label>
 *		<input type="number" min="1" max="1000000" id="maxHP1"/>
 *		<br class="clear" />
 *
 *		<label for="res">Resistance</label>
 *		<input type="number" min="0" max="95" id="res1"/>
 *		<br class="clear" />
 *
 *		<label for="posX1">Position X</label>
 *		<input type="range" min="0" step="0.1" max="14" id="posX1"/>
 *		<br class="clear" />
 *
 *		<label for="posY1">Position Y</label>
 *		<input type="range" min="0" step="0.1" max="8" id="posY1"/>
 *		<br class="clear"/>
 *		<button id="deleteDummy1" class="delete">Delete</button>
 *		<button id="deactivateDummy1">Deactivate</button>
 *	</fieldset>
 */
let addNewTargetDummySection = function(){
    // We need to retrieve the last index of the dummies and increment,
    // otherwise the listeners won't be added correctly
    let index = akGame.dummies.length;

    // Fieldset
    let fieldset = document.createElement("fieldset");
    fieldset.id = "targetDummy"+index;

    // Legend
    let legend = document.createElement("legend");
    legend.innerText = "Target Dummy "+index;

    // Br, added after every input section
    let br = document.createElement("br");
    br.classList.add("clear");

    // Max HP
    let maxHPLabel = document.createElement("label");
    maxHPLabel.for = "maxHP"+index;
    maxHPLabel.innerText = "Maximum HP";
    let maxHP = document.createElement("input");
    maxHP.type = "number";
    maxHP.min = 1;
    maxHP.max = 1000000;
    maxHP.id = "maxHP"+index;
    maxHP.value = 10000;

    // Res
    let resLabel = document.createElement("label");
    resLabel.for = "res"+index;
    resLabel.innerText = "Resistance";
    let res = document.createElement("input");
    res.type = "number";
    res.min = 0;
    res.max = 95;
    res.id = "res"+index;
    res.value = 0;

    // Pos X
    let posXLabel = document.createElement("label");
    posXLabel.for = "posX"+index;
    posXLabel.innerText = "Position X";
    let posX = document.createElement("input");
    posX.type = "range";
    posX.min = 0;
    posX.step = 0.1;
    posX.max = 14;
    posX.id = "posX"+index;
    posX.value = 5;

    // Pos Y
    let posYLabel = document.createElement("label");
    posYLabel.for = "posY"+index;
    posYLabel.innerText = "Position Y";
    let posY = document.createElement("input");
    posY.type = "range";
    posY.min = 0;
    posY.step = 0.1;
    posY.max = 8;
    posY.id = "posY"+index;
    posY.value = 5;

    // Buttons
    let deleteDummy = document.createElement("button");
    deleteDummy.id = "deleteDummy"+index;
    deleteDummy.classList.add("delete");
    deleteDummy.innerText = "Delete";

    let deactivateDummy = document.createElement("button");
    deactivateDummy.id = "deactivateDummy"+index;
    deactivateDummy.innerText = "Deactivate";

    let reactivateDummy = document.createElement("button");
    reactivateDummy.id = "reactivateDummy"+index;
    reactivateDummy.innerText = "Reactivate";
    reactivateDummy.classList.add("hide");

    // Building the tree itself
    [
        legend, maxHPLabel, maxHP, br, resLabel, res, br, posXLabel, posX, br,
        posYLabel, posY, br, deleteDummy, deactivateDummy, reactivateDummy
    ].forEach(function(element){
        fieldset.appendChild(element);
    });
    let manager = document.getElementById("targetDummyManager");
    manager.appendChild(fieldset);
    manager.appendChild(br);

    // That's cool and all, but if changing the buttons does nothing, that ain't good.
    addBehaviorToDummyUi(index);
};

let addBehaviorToDummyUi = function(index){
    document.getElementById("maxHP"+index).addEventListener("input", (e) => {
        akGame.dummies[index].maxHP = parseInt(e.target.value);
        akGame.dummies[index].currHP = parseInt(e.target.value);
        akRenderer.display();
    });

    document.getElementById("res"+index).addEventListener("input", (e) => {
        akGame.dummies[index].resistance = parseInt(e.target.value);
        akRenderer.display();
    });

    document.getElementById("posX"+index).addEventListener("input", (e) => {
        akGame.dummies[index].x = parseFloat(e.target.value);
        akRenderer.display();
    });

    document.getElementById("posY"+index).addEventListener("input", (e) => {
        akGame.dummies[index].y = parseFloat(e.target.value);
        akRenderer.display();
    });

    document.getElementById("deleteDummy"+index).addEventListener("click", (e) => {
        akGame.dummies[index].activated = false;
        akRenderer.display();
        document.getElementById("targetDummy"+index).remove();
    });

    document.getElementById("deactivateDummy"+index).addEventListener("click", (e) => {
        akGame.dummies[index].activated = false;
        e.target.classList.add("hide");
        document.getElementById("reactivateDummy"+index).classList.remove("hide");
        akRenderer.display();
    });

    document.getElementById("reactivateDummy"+index).addEventListener("click", (e) => {
        akGame.dummies[index].activated = true;
        e.target.classList.add("hide");
        document.getElementById("deactivateDummy"+index).classList.remove("hide");
        akRenderer.display();
    });
};

/**
 * 
 * @param {Boolean} isEnabled: true if the fieldsets should be interactable by the user, false otherwise
 */
let setFieldsetsInteractable = function(isEnabled){
    [].slice.call(document.getElementsByTagName("fieldset")).forEach(e => e.disabled = !isEnabled);
};