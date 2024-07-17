"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// socketInstance.js
const socket_io_client_1 = __importDefault(require("socket.io-client"));
// import { REACT_APP_API_SERVER_URL } from "./config"; // Stellen Sie sicher, dass Sie die Umgebungsvariable korrekt definieren
const server = process.env.REACT_APP_API_SERVER_URL;
const socket = (0, socket_io_client_1.default)("" + server);
exports.default = socket;
//# sourceMappingURL=socketInstance.js.map