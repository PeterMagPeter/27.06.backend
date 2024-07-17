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
exports.default = EditProfile;
const Header_1 = __importDefault(require("../components/Header/Header"));
const react_1 = require("react");
const userAPI_1 = require("../backendAPI/userAPI");
const profile_pic_placeholder_png_1 = __importDefault(require("../assets/pictures/profile_pic_placeholder.png"));
const react_redux_1 = require("react-redux");
const PageProfile_module_css_1 = __importDefault(require("./PageProfile.module.css"));
const TestReducer_1 = require("../components/reducer/TestReducer");
const Resources_1 = require("../Resources");
const socketInstance_1 = __importDefault(require("../components/Websocket/socketInstance"));
const react_bootstrap_1 = require("react-bootstrap");
/**
 *
 * Add: settings route for browser navigation
 */
function EditProfile() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const user = (0, react_redux_1.useSelector)((state) => state.userReducer.user);
    const skin = (0, react_redux_1.useSelector)((state) => state.userReducer.skin);
    const [modalText, setModalText] = (0, react_1.useState)();
    const [modalTitle, setModalTitle] = (0, react_1.useState)();
    const [modalBg, setModalBg] = (0, react_1.useState)();
    const [showModal, setShowModal] = (0, react_1.useState)(false);
    const [userData, setUserData] = (0, react_1.useState)({
        email: user.email,
        password: user.password,
    });
    const [skinSetting, setSkinSetting] = (0, react_1.useState)(false);
    const [skinKey, setSkinKey] = (0, react_1.useState)(skin);
    const [edit, setEdit] = (0, react_1.useState)("");
    function handleChange(e) {
        return __awaiter(this, void 0, void 0, function* () {
            setUserData(Object.assign(Object.assign({}, userData), { [e.target.name]: e.target.value }));
        });
    }
    (0, react_1.useEffect)(() => {
        socketInstance_1.default.emit("sendGiveMeMySkin", user.username);
        return () => { };
    }, []);
    function updateUser() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, userAPI_1.putUser)({
                _id: user._id,
                email: user.email,
                password: user.password,
                username: user.username,
            });
            dispatch((0, TestReducer_1.setUser)({
                email: userData.email,
                loggedIn: true,
            }));
        });
    }
    function saveSkin(val) {
        dispatch((0, TestReducer_1.setSkin)({ skin: val }));
        console.log((0, Resources_1.getSkinImage)(skin));
    }
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        // const newSocket: any = io(`${server}`);
        if (socketInstance_1.default) {
            socketInstance_1.default.on("changeSkinSuccesfully", () => {
                setModalText("Skin has been updated.");
                setModalTitle("Success!");
                setShowModal(true);
                setModalBg("success");
                setTimeout(() => {
                    setShowModal(false);
                }, 3000);
            });
            socketInstance_1.default.on("changeSkinFailed", () => {
                setModalText("Could not update skin.");
                setModalTitle("Error");
                setShowModal(true);
                setModalBg("danger");
                setTimeout(() => {
                    setShowModal(false);
                }, 3000);
            });
            socketInstance_1.default.on("giveSkin", (skin) => {
                setSkinKey(skin);
            });
        }
    });
    return (<>
      <Header_1.default />
      <div className={PageProfile_module_css_1.default.profilePage}>
        <react_bootstrap_1.Toast show={showModal} animation={true} className="blur-background" style={{ zIndex: "20" }} 
    // delay={3000}
    // autohide
    bg={modalBg}>
          <react_bootstrap_1.Toast.Header className={""}>{modalTitle}</react_bootstrap_1.Toast.Header>
          <react_bootstrap_1.Toast.Body>{modalText}</react_bootstrap_1.Toast.Body>
        </react_bootstrap_1.Toast>
        <div className={PageProfile_module_css_1.default.profileDiv}>
          {!skinSetting ? (<>
              <img className={PageProfile_module_css_1.default.settingsImg} src={profile_pic_placeholder_png_1.default} onClick={() => (edit == "" ? setEdit("picClick") : setEdit(""))}/>
              <br />
              {edit == "picClick" && (<button className={PageProfile_module_css_1.default.settingsButton} onClick={() => setEdit("pic")}>
                  Change
                </button>)}
              {edit == "pic" && (<>
                  <input className={PageProfile_module_css_1.default.inputField} type="file"></input>
                  <br />
                  <button className={PageProfile_module_css_1.default.settingsButton}>Save</button>
                  <button onClick={() => setEdit("")} className={PageProfile_module_css_1.default.logoutButton}>
                    Cancel
                  </button>
                </>)}
              <hr />
              <button className={PageProfile_module_css_1.default.settingsButton} onClick={() => setSkinSetting(true)}>
                Set ship skins
              </button>
              <hr />
              <label>
                <b>E-mail: </b>
                {user.email}
              </label>
              <br />
              {edit == "email" ? (<>
                  <input className={PageProfile_module_css_1.default.inputField} type="email" name="email" placeholder="Change e-mail adress" onChange={handleChange}></input>
                  <br />
                  <button onClick={() => {
                    updateUser();
                    setEdit("");
                }} className={PageProfile_module_css_1.default.settingsButton}>
                    Save changes
                  </button>
                  <button onClick={() => setEdit("")} className={PageProfile_module_css_1.default.logoutButton}>
                    Cancel
                  </button>
                </>) : (<button onClick={() => setEdit("email")} className={PageProfile_module_css_1.default.settingsButton}>
                  Change e-mail address
                </button>)}
              <hr />
              {edit == "password" ? (<>
                  <input className={PageProfile_module_css_1.default.inputField} type="password" name="password" placeholder="Old password" onChange={handleChange}></input>
                  <br />
                  <input className={PageProfile_module_css_1.default.inputField} type="password" placeholder="New password"></input>
                  <br />
                  <input className={PageProfile_module_css_1.default.inputField} type="password" placeholder="Confirm new password"></input>
                  <br />
                  <button onClick={() => {
                    updateUser();
                    setEdit("");
                }} className={PageProfile_module_css_1.default.settingsButton}>
                    Save changes
                  </button>
                  <button onClick={() => setEdit("")} className={PageProfile_module_css_1.default.logoutButton}>
                    Cancel
                  </button>
                </>) : (<button onClick={() => setEdit("password")} className={PageProfile_module_css_1.default.logoutButton}>
                  Change account password
                </button>)}
            </>) : (<>
              <img src={(0, Resources_1.getSkinImage)(skinKey)} className={PageProfile_module_css_1.default.skinImg}/>
              {/* <img src="src/assets/pictures/Skins/Grün/3.png"/> */}
              <br />
              <label>Choose skin</label>
              <select className={PageProfile_module_css_1.default.skinSelect} onChange={(e) => {
                setSkinKey(e.target.value);
                socketInstance_1.default.emit("sendChangeSkin", user.username, e.target.value);
                saveSkin(e.target.value);
            }} value={skinKey}>
                <option value="standard">Standard</option>
                <option value="green">Green</option>
                <option value="pink">Pink</option>
                <option value="turquoise">Turquoise</option>
                <option value="camouflage">Camouflage</option>
                <option value="cow">Cow</option>
                <option value="duck">Duck</option>
                <option value="dog">Dog</option>
                <option value="sausage">Sausage</option>
              </select>
              <br />
              <button className={PageProfile_module_css_1.default.logoutButton} onClick={() => setSkinSetting(false)}>
                Back to settings
              </button>
            </>)}
        </div>
      </div>
    </>);
}
//# sourceMappingURL=ProfileSettings.js.map