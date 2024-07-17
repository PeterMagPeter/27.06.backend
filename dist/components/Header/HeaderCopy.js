"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;
const Header_module_css_1 = __importDefault(require("./Header.module.css"));
const react_bootstrap_1 = require("react-bootstrap");
const cof_logo_vert_png_1 = __importDefault(require("../../assets/pictures/cof_logo_vert.png"));
const profile_pic_placeholder_png_1 = __importDefault(require("../../assets/pictures/profile_pic_placeholder.png"));
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const loginAPI_1 = require("../../backendAPI/loginAPI");
const react_redux_2 = require("react-redux");
const TestReducer_1 = require("../reducer/TestReducer");
const react_router_dom_1 = require("react-router-dom");
const LobbyReducer_1 = require("../reducer/LobbyReducer");
const socketInstance_1 = __importDefault(require("../Websocket/socketInstance"));
function Header() {
    let loggedIn = (0, react_redux_1.useSelector)((state) => state.userReducer.loggedIn);
    let roomId = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.roomId);
    let nick = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let guest = (0, react_redux_1.useSelector)((state) => state.userReducer.guest);
    const [soundOn, setSoundOn] = (0, react_1.useState)(true);
    const [musicOn, setMusicOn] = (0, react_1.useState)(true);
    const dispatch = (0, react_redux_2.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleLogout = () => __awaiter(this, void 0, void 0, function* () {
        yield (0, loginAPI_1.deleteLogin)();
        dispatch((0, TestReducer_1.deleteUser)());
        navigate("/");
    });
    function handleHome() {
        socketInstance_1.default.emit("sendLeaveRoom", roomId);
        dispatch((0, LobbyReducer_1.deleteLobby)());
        navigate("/");
    }
    function handleLogin() {
        dispatch((0, TestReducer_1.deleteUser)());
        navigate("/");
    }
    return (<react_bootstrap_1.Navbar className="bg-body-tertiary" data-bs-theme="dark">
      <div className={Header_module_css_1.default.headerStack}>
        <div className={Header_module_css_1.default.logo}>
          <react_bootstrap_1.Image onClick={() => handleHome()} className={Header_module_css_1.default.homeImg} src={cof_logo_vert_png_1.default} width={"250px"}/>
        </div>
        <div className={Header_module_css_1.default.profileContainer}>
          {!guest && (<div className={Header_module_css_1.default.imageContainer}>
              <react_bootstrap_1.Image onClick={() => navigate("/profile")} className={Header_module_css_1.default.profileImg} src={profile_pic_placeholder_png_1.default}/>
            </div>)}
          <div className={Header_module_css_1.default.headerDropdown}>
            <react_bootstrap_1.Nav>
              <react_bootstrap_1.NavDropdown title={loggedIn ? nick : "Menu"} align={"end"}>
                {!guest && (<react_bootstrap_1.NavDropdown.Item onClick={() => navigate("/profile")}>
                    Profile settings
                  </react_bootstrap_1.NavDropdown.Item>)}
                {soundOn ? (<react_bootstrap_1.NavDropdown.Item onClick={() => setSoundOn(false)}>
                    Sound off
                  </react_bootstrap_1.NavDropdown.Item>) : (<react_bootstrap_1.NavDropdown.Item onClick={() => setSoundOn(true)}>
                    Sound on
                  </react_bootstrap_1.NavDropdown.Item>)}
                {musicOn ? (<react_bootstrap_1.NavDropdown.Item onClick={() => setMusicOn(false)}>
                    Music off
                  </react_bootstrap_1.NavDropdown.Item>) : (<react_bootstrap_1.NavDropdown.Item onClick={() => setMusicOn(true)}>
                    Music on
                  </react_bootstrap_1.NavDropdown.Item>)}
                <react_bootstrap_1.NavDropdown.Divider />
                {guest ? (<react_bootstrap_1.NavDropdown.Item onClick={() => handleLogin()}>
                    Login
                  </react_bootstrap_1.NavDropdown.Item>) : (<react_bootstrap_1.NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </react_bootstrap_1.NavDropdown.Item>)}
              </react_bootstrap_1.NavDropdown>
            </react_bootstrap_1.Nav>
          </div>
        </div>
      </div>
    </react_bootstrap_1.Navbar>);
}
//# sourceMappingURL=HeaderCopy.js.map