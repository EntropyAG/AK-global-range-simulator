let getMouseCoords = (canvas, event) => {
    let canvasCoords = canvas.getBoundingClientRect();
    return {
        x: event.pageX - canvasCoords.left + canvasCoords.x - canvas.offsetLeft,
        y: event.pageY - canvasCoords.top + canvasCoords.y - canvas.offsetTop
    };
};

let getOffsetCoords = (mouse, rect) => {
    return {
        x: mouse.x - rect.x,
        y: mouse.y - rect.y
    };
};

let cursorInRect = (mouseX, mouseY, rectX, rectY, rectW, rectH) => {
    let xLine = mouseX > rectX && mouseX < rectX + rectW;
    let yLine = mouseY > rectY && mouseY < rectY + rectH;

    return xLine && yLine;
};

let updateGameObjectPos = (obj, mouseCoords) => {
    if (obj.selected) {
        obj.x = (mouseCoords.x - obj.offset.x) / akRenderer.getBoundedScaleFactor();
        obj.y = (mouseCoords.y - obj.offset.y) / akRenderer.getBoundedScaleFactor();
    }
};

let checkIfMouseOnObject = (obj, objCanvasSize, mouseCoords) => {
    let pos = akRenderer.getGameObjectCanvasPos(obj);
    if (cursorInRect(mouseCoords.x, mouseCoords.y, pos.x - objCanvasSize/2, pos.y - objCanvasSize/2, objCanvasSize, objCanvasSize)) {
        obj.selected = true;
        obj.offset = getOffsetCoords(mouseCoords, pos);
    } else {
        obj.selected = false;
    }
};

// Listeners

akRenderer.canvas.addEventListener('mousemove', e => {
    let mouseCoords = getMouseCoords(akRenderer.canvas, e);
    akGame.dummies.forEach(dummy => {
        updateGameObjectPos(dummy, mouseCoords);
    });
    updateGameObjectPos(akGame.lappland, mouseCoords);
});

akRenderer.canvas.addEventListener('mousedown', e => {
    let mouseCoords = getMouseCoords(akRenderer.canvas, e);
    akGame.dummies.forEach(dummy => {
        checkIfMouseOnObject(dummy, akRenderer.getDummySize(), mouseCoords);
    });
    checkIfMouseOnObject(akGame.lappland, akRenderer.getLappySize(), mouseCoords);
});

akRenderer.canvas.addEventListener('mouseup', e => {
    akGame.dummies.forEach(dummy => dummy.selected = false);
    akGame.lappland.selected = false;
});