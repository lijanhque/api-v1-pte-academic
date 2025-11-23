"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrUndefined = isNullOrUndefined;
exports.isAlive = isAlive;
/**
 * Because since node 4.0.0 the internal util.is* functions got deprecated
 * @param val Any value to test if null or undefined
 */
function isNullOrUndefined(val) {
    return val === null || val === undefined;
}
/**
 * Check whether a PID is alive
 * @param pid PID
 */
function isAlive(pid) {
    if (isNullOrUndefined(pid)) {
        return false;
    }
    try {
        // code 0 doesn't actually kill anything (on all supported systems)
        process.kill(pid, 0);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=db_util.js.map