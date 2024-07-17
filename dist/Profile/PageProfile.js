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
exports.default = PageProfile;
const react_bootstrap_1 = require("react-bootstrap");
const profile_pic_placeholder_png_1 = __importDefault(require("../assets/pictures/profile_pic_placeholder.png"));
const Header_1 = __importDefault(require("../components/Header/Header"));
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const ProfileSettings_1 = __importDefault(require("./ProfileSettings"));
const loginAPI_1 = require("../backendAPI/loginAPI");
const react_redux_2 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const TestReducer_1 = require("../components/reducer/TestReducer");
const PageProfile_module_css_1 = __importDefault(require("./PageProfile.module.css"));
function PageProfile() {
    // let nick: string = "Peter";
    let lvl = 1;
    let points = (0, react_redux_1.useSelector)((state) => state.userReducer.points);
    const nick = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    const user = (0, react_redux_1.useSelector)((state) => state.userReducer.user);
    const [edit, setEdit] = (0, react_1.useState)(false);
    const dispatch = (0, react_redux_2.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleLogout = () => __awaiter(this, void 0, void 0, function* () {
        yield (0, loginAPI_1.deleteLogin)();
        dispatch((0, TestReducer_1.deleteUser)());
        navigate("/");
    });
    if (edit) {
        return (<>
        <ProfileSettings_1.default />
      </>);
    }
    else {
        return (<>
        <Header_1.default />
        <div className={PageProfile_module_css_1.default.profilePage}>
          <div className={PageProfile_module_css_1.default.profileDiv}>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col>
                <img src={profile_pic_placeholder_png_1.default} className={PageProfile_module_css_1.default.profileImg}/>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col>
                <h4 className={PageProfile_module_css_1.default.profileText}>{nick}</h4>
                <h4 className={PageProfile_module_css_1.default.profileText}>Level {user.level}</h4>
                <h4 className={PageProfile_module_css_1.default.profileText}>{user.points} XP</h4>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <hr />
            <button className={PageProfile_module_css_1.default.settingsButton} onClick={() => setEdit(true)}>
              Settings
            </button>
            <button className={PageProfile_module_css_1.default.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </>);
    }
}
//# sourceMappingURL=PageProfile.js.map