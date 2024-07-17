"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LobbyTest;
const react_1 = require("react");
const react_bootstrap_1 = require("react-bootstrap");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const LobbyReducer_1 = require("../../reducer/LobbyReducer");
const socketInstance_1 = __importDefault(require("../../Websocket/socketInstance"));
const server = process.env.REACT_APP_API_SERVER_URL;
function LobbyTest() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let newRoomId = (0, react_1.useRef)("");
    //   const socket = useWebSocket();
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        if (!socketInstance_1.default)
            return;
        socketInstance_1.default.on("startShipPlacement", () => {
            navigate("/shipplacement");
        });
        return () => {
        };
    }, [socketInstance_1.default]);
    const joinLobby = () => {
        newRoomId.current = "cooleLobby";
        socketInstance_1.default.emit("sendJoinRoom", newRoomId.current, username);
        console.log("join", newRoomId.current);
        dispatch((0, LobbyReducer_1.setRoomId)({
            roomId: newRoomId.current,
        }));
    };
    return <react_bootstrap_1.Button onClick={joinLobby}> join lobby</react_bootstrap_1.Button>;
}
//# sourceMappingURL=LobbyTest.js.map