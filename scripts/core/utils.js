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

/**
 * Javascript is a cool language until it isn't, and not having a function to cleanly round
 * to a certain digit makes me want to feed the people who came up with it to a starved Ceobe.
 * @param {float} num: the number to round
 * @param {integer} digits: how many digits to round to. 0 means the nearest integer,
 * 2 means 2 decimals, etc.
 * @returns the rounded number according to the given arguments
 */
let roundTo = function(num, digits) {
    if(!digits){
        digits = 0;
    }
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
};