let secToFrames = function(sec){
    return msToFrames(1000 * sec);
};

let msToFrames = function(ms){
    return ms / akGame.fps;
};

let framesToMs = function(frameCount){
    return frameCount * 1000 / akGame.fps;
};

let tilesPerSecToTilesPerFrame = function(tps){
    return tps / 1000 * akGame.fps;
};

let raidiansPerSecToRaidiansPerFrame = function(raidians){
    return raidians / 1000 * akGame.fps;
};