"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageOnline;
const Header_1 = __importDefault(require("../Header/Header"));
const PageOnline_module_css_1 = __importDefault(require("./PageOnline.module.css"));
const react_router_dom_1 = require("react-router-dom");
const react_redux_1 = require("react-redux");
const LobbyReducer_1 = require("../reducer/LobbyReducer");
const Resources_1 = require("../../Resources");
function PageOnline() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const dispatch = (0, react_redux_1.useDispatch)();
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    function hostLobby() {
        let newRoomid = (0, Resources_1.generateRoomId)();
        console.log(newRoomid);
        dispatch((0, LobbyReducer_1.setHostName)({ hostName: username }));
        dispatch((0, LobbyReducer_1.setRoomId)({ roomId: newRoomid }));
        navigate("/onlineGameSettings");
    }
    return (<>
      <Header_1.default />
      <div className={PageOnline_module_css_1.default.onlinePage}>
        <button className={PageOnline_module_css_1.default.onlineButton} onClick={() => hostLobby()}>
          Host Game
        </button>
        <button className={PageOnline_module_css_1.default.onlineButton} onClick={() => navigate("/lobby")}>
          Join Game
        </button>
      </div>
    </>);
}
//# sourceMappingURL=PageOnline.js.map