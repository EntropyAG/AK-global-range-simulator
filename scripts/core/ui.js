/**
 * The following listeners are executed on script load, since they apply to
 * elements that are not removed/added
 */

// Target dummies

document.getElementById("addDummy").addEventListener("click", (e) => {
    addNewTargetDummySection();
    akGame.dummies.push(new TargetDummy(akGame.dummies.length, 5, 5, 10000));
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
 *		<button id="deleteDummy1" class="delete">Delete</button>
 *		<button id="deactivateDummy1">Deactivate</button>
 *		<button id="duplicateDummy1">Duplicate</button>
 *	</fieldset>
 */
let addNewTargetDummySection = function(dummy){
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
    maxHP.value = dummy ? dummy.maxHP : 10000;

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

    let duplicateDummy = document.createElement("button");
    duplicateDummy.id = "duplicateDummy"+index;
    duplicateDummy.innerText = "Duplicate";

    // Building the tree itself
    [
        legend, maxHPLabel, maxHP, br, deleteDummy, deactivateDummy, reactivateDummy, duplicateDummy
    ].forEach(function(element){
        fieldset.appendChild(element);
    });
    let manager = document.getElementById("targetDummyManager");
    manager.appendChild(fieldset);

    // That's cool and all, but if changing the buttons does nothing, that ain't good.
    addBehaviorToDummyUi(index);
};

/**
 * Following the generation of an HTML section by addBehaviorToDummyUi(), use this function to add
 * events to the different elements.
 * @param {Integer} index: the index of the section where you want events to be listened to
 */
let addBehaviorToDummyUi = function(index){
    document.getElementById("maxHP"+index).addEventListener("input", (e) => {
        akGame.dummies[index].maxHP = parseInt(e.target.value);
        akGame.dummies[index].currHP = parseInt(e.target.value);
    });

    document.getElementById("deleteDummy"+index).addEventListener("click", (e) => {
        akGame.dummies[index].activated = false;
        document.getElementById("targetDummy"+index).remove();
    });

    document.getElementById("deactivateDummy"+index).addEventListener("click", (e) => {
        akGame.dummies[index].activated = false;
        e.target.classList.add("hide");
        document.getElementById("reactivateDummy"+index).classList.remove("hide");
    });

    document.getElementById("reactivateDummy"+index).addEventListener("click", (e) => {
        akGame.dummies[index].activated = true;
        e.target.classList.add("hide");
        document.getElementById("deactivateDummy"+index).classList.remove("hide");
    });

    document.getElementById("duplicateDummy"+index).addEventListener("click", (e) => {
        let dummyToDuplicate = akGame.dummies[index];
        let newDummy = new TargetDummy(
            akGame.dummies.length,
            dummyToDuplicate.x,
            dummyToDuplicate.y + 0.3, // Slight displacement to make it easier to spot
            dummyToDuplicate.maxHP
        );
        addNewTargetDummySection(newDummy);
        akGame.dummies.push(newDummy);
    });
};

/**
 * Makes all fields/buttons interactable or not, used during a simulation to prevent breaking everything
 * @param {Boolean} isEnabled: true if the fieldsets should be interactable by the user, false otherwise
 */
let setFieldsetsInteractable = function(isEnabled){
    [].slice.call(document.getElementsByTagName("fieldset")).forEach(e => e.disabled = !isEnabled);
};

let updateDisplayedMetrics = function(metrics){
    Object.keys(akGame.dpsMetrics).forEach(function(key){
        document.getElementById(key).innerText = Math.round(akGame.dpsMetrics[key]);
    });
};