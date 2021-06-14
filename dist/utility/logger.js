"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static log(value) {
        console.log(`[${new Date(Date.now()).toLocaleTimeString()}][EzMongoDB] ${value}`);
    }
    static error(value) {
        console.error(`[${new Date(Date.now()).toLocaleTimeString()}][EzMongoDB] ${value}`);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map