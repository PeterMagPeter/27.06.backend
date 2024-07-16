"use strict";
/* istanbul ignore file */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
exports.logger = winston_1.default.createLogger({
    level: 'debug',
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.simple(), winston_1.default.format.colorize({ all: true })),
        }),
        new winston_1.default.transports.File({
            filename: 'all.log',
            format: winston_1.default.format.simple()
        })
    ]
});
//# sourceMappingURL=logger.js.map