/**
 * Returns the coordinates of the mouse click within the canvas itself.
 * @param {HTMLCanvasElement} canvas: the canvas to use to calculate the relative position
 * @param {MouseEvent} event: Event created from "mousedown"
 * @returns object with x;y coordinates
 */
let getMouseCoords = (canvas, event) => {
    let canvasCoords = canvas.getBoundingClientRect();
    return {
        x: event.pageX - canvasCoords.left + canvasCoords.x - canvas.offsetLeft,
        y: event.pageY - canvasCoords.top + canvasCoords.y - canvas.offsetTop
    };
};

/**
 * Returns the difference between the top-left part of a selected image and the actual position
 * of the mouse within the image.
 * @param {Object} mouse: the coordinates of the mouse, an object with x;y values
 * @param {Object} rect: the coordinates of the image selected, an object with x;y values
 * @returns {Object} with x;y coordinates, which is the difference between the mouse and rect coordinates
 */
let getOffsetCoords = (mouse, rect) => {
    return {
        x: mouse.x - rect.x,
        y: mouse.y - rect.y
    };
};

/**
 * Checks whether a point (defined by its coordinates after mouse clicking) is within a rectangle
 * defined by its top-left position and the size of its edges.
 * @param {Float} mouseX: X coordinate of the mouse click
 * @param {Float} mouseY: Y coordinate of the mouse click
 * @param {Float} rectX: X coordinate of the top-left corner
 * @param {Float} rectY: Y coordinate of the top-left corner
 * @param {Float} rectW: width of the rectangle
 * @param {Float} rectH: height of the rectangle
 * @returns {Boolean} true if the mouse click is within the rectangle, false otherwise
 */
let isCursorInRect = (mouseX, mouseY, rectX, rectY, rectW, rectH) => {
    let xLine = mouseX > rectX && mouseX < rectX + rectW;
    let yLine = mouseY > rectY && mouseY < rectY + rectH;

    return xLine && yLine;
};

/**
 * Update the position of a given object to the current position of the user's cursor
 * @param {GameObject} obj: GameObject to be moved
 * @param {Object} mouseCoords: object with x;y coordinates which will become the new position of the
 * GameObject.
 */
let updateGameObjectPos = (obj, mouseCoords) => {
    if (obj.selected) {
        obj.x = (mouseCoords.x - obj.offset.x) / akRenderer.getBoundedScaleFactor();
        obj.y = (mouseCoords.y - obj.offset.y) / akRenderer.getBoundedScaleFactor();
    }
};

/**
 * For a given GameObject, set is as selected (or not) depending on whether the cursor is on it when the
 * user clicks down the button.
 * @param {GameObject} obj: the object to set as selected
 * @param {Float} objCanvasSize 
 * @param {Object} mouseCoords: object with coordinates x;y
 */
let setSelectedIfMouseOnObject = (obj, objCanvasSize, mouseCoords) => {
    let pos = akRenderer.getGameObjectCanvasPos(obj);
    // Because GameObjects' actual position is their center when rendered,
    // we need to offset them to the top-left by half their size
    if (isCursorInRect(
            mouseCoords.x, mouseCoords.y,
            pos.x - objCanvasSize/2, pos.y - objCanvasSize/2,
            objCanvasSize, objCanvasSize
        )
    ) {
        obj.selected = true;
        obj.offset = getOffsetCoords(mouseCoords, pos);
    } else {
        obj.selected = false;
    }
};

/*************
 * Listeners *
 *************/

// Set all GameObjects that are under the cursor as being selected when pressing the left mouse button
akRenderer.canvas.addEventListener('mousedown', e => {
    let mouseCoords = getMouseCoords(akRenderer.canvas, e);
    akGame.dummies.forEach(dummy => {
        setSelectedIfMouseOnObject(dummy, akRenderer.getDummySize(), mouseCoords);
    });
    setSelectedIfMouseOnObject(akGame.lappland, akRenderer.getLappySize(), mouseCoords);
});

// All objects that are currently selected (as per the previous listener) will be moved around
akRenderer.canvas.addEventListener('mousemove', e => {
    let mouseCoords = getMouseCoords(akRenderer.canvas, e);
    akGame.dummies.forEach(dummy => {
        updateGameObjectPos(dummy, mouseCoords);
    });
    updateGameObjectPos(akGame.lappland, mouseCoords);
});

// Unselect all dummies and Lappland when releasing the button
akRenderer.canvas.addEventListener('mouseup', e => {
    akGame.dummies.forEach(dummy => dummy.selected = false);
    akGame.lappland.selected = false;
});