"use strict";
// useWebSocket.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const server = process.env.REACT_APP_API_SERVER_URL;
const useWebSocket = () => {
    const [socket, setSocket] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const newSocket = (0, socket_io_client_1.default)(`${server}`);
        newSocket.on("connect", () => {
            console.log("Connected to server");
        });
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, []);
    return socket;
};
exports.default = useWebSocket;
//# sourceMappingURL=useWebSocket.js.map