"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = require("path");
const swaggerDocument = yamljs_1.default.load((0, path_1.join)(__dirname, '../swagger.yaml'));
exports.default = swaggerDocument;
//# sourceMappingURL=swaggerConfig.js.map