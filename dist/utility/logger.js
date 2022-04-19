"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function (value) {
        console.log("[".concat(new Date(Date.now()).toLocaleTimeString(), "][EzMongoDB] ").concat(value));
    };
    Logger.error = function (value) {
        console.error("[".concat(new Date(Date.now()).toLocaleTimeString(), "][EzMongoDB] ").concat(value));
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map