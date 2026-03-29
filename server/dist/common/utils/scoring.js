"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointsFromTaps = pointsFromTaps;
exports.pointsDeltaForNextTap = pointsDeltaForNextTap;
function pointsFromTaps(taps) {
    if (taps <= 0) {
        return 0;
    }
    return taps + 9 * Math.floor(taps / 11);
}
function pointsDeltaForNextTap(currentTaps) {
    const next = currentTaps + 1;
    return pointsFromTaps(next) - pointsFromTaps(currentTaps);
}
//# sourceMappingURL=scoring.js.map