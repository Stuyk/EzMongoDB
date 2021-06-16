"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function (value) {
        console.log("[" + new Date(Date.now()).toLocaleTimeString() + "][EzMongoDB] " + value);
    };
    Logger.error = function (value) {
        console.error("[" + new Date(Date.now()).toLocaleTimeString() + "][EzMongoDB] " + value);
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map