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
const SignIn_module_css_1 = __importDefault(require("./SignIn.module.css"));
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const react_bootstrap_1 = require("react-bootstrap");
const TestReducer_1 = require("../reducer/TestReducer");
const cof_logo_png_1 = __importDefault(require("../../assets/pictures/cof_logo.png"));
const loginAPI_1 = require("../../backendAPI/loginAPI");
const userAPI_1 = require("../../backendAPI/userAPI");
const react_router_dom_1 = require("react-router-dom");
const Resources_1 = require("../../Resources");
const server = process.env.REACT_APP_API_SERVER;
const SignIn = () => {
    const dispatch = (0, react_redux_1.useDispatch)();
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const base64 = btoa(`${email}:${password}`);
    const navigate = (0, react_router_dom_1.useNavigate)();
    let signInCounter = (0, react_redux_1.useSelector)((state) => state.userReducer.signInCounter);
    const handleLogin = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        console.log(typeof email, typeof password);
        const loginResponse = yield (0, loginAPI_1.postLogin)(email, password);
        const getLoggedIn = yield (0, userAPI_1.getUser)(loginResponse.id);
        // if (getLoggedIn){
        console.log(getLoggedIn.email, " email");
        dispatch((0, TestReducer_1.setUser)({
            email: getLoggedIn.email,
            loggedIn: true,
            username: getLoggedIn.username,
            guest: false
        }));
        // }
        // wenn login erfolgreich soll im redux store die entsprechenden daten gesetzt werden
        // aus login response sollte unsername noch ankommen
    });
    function handleGuest() {
        dispatch((0, TestReducer_1.setUser)({
            email: email === "" ? "guest" + (0, Resources_1.generateRoomId)() : email,
            loggedIn: true,
            username: email === "" ? "guest" + (0, Resources_1.generateRoomId)() : email,
            guest: email === "" ? true : false
        }));
    }
    return (<react_bootstrap_1.Container className={SignIn_module_css_1.default.container}>
      <react_bootstrap_1.Container className={SignIn_module_css_1.default.imageContainer}>
        <react_bootstrap_1.Image className={SignIn_module_css_1.default.image} src={cof_logo_png_1.default}/>
      </react_bootstrap_1.Container>

      <react_bootstrap_1.Container className={SignIn_module_css_1.default.signIn}>
        <react_bootstrap_1.Form className={SignIn_module_css_1.default.FormGroup}>
          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Control id="EmailInput" type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} autoFocus required/>
          </react_bootstrap_1.Form.Group>
          <react_bootstrap_1.Form.Group className="mb-3">
            <react_bootstrap_1.Form.Control id="PasswordInput" type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
          </react_bootstrap_1.Form.Group>
          <react_bootstrap_1.Button variant="primary" type="submit" className="w-100" onClick={(e) => handleLogin(e)}>
            Sign In
          </react_bootstrap_1.Button>
          <hr />
          <div className="social-login text-center">
            <react_bootstrap_1.Button variant="outline-primary" className="me-2">
              Facebook
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="outline-danger" className="me-2">
              Google
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button variant="outline-info" className="me-2">
              Twitter
            </react_bootstrap_1.Button>
          </div>
          <div className={SignIn_module_css_1.default.gastButton}>
            <react_bootstrap_1.Button onClick={() => handleGuest()} variant="info" className={SignIn_module_css_1.default.gastButton}>
              Als Gast fortfahren
            </react_bootstrap_1.Button>
          </div>
          <react_bootstrap_1.Alert variant="primary" className="text-center mt-3">
          Want to create an account? {"\n"}
          <react_bootstrap_1.Alert.Link onClick={() => navigate("/registration")}>Sign up</react_bootstrap_1.Alert.Link>
        </react_bootstrap_1.Alert>
        </react_bootstrap_1.Form>
      </react_bootstrap_1.Container>
    </react_bootstrap_1.Container>);
};
exports.default = SignIn;
//# sourceMappingURL=SignIn.js.map