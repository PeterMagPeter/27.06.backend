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
exports.default = Registration;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const Registration_module_css_1 = __importDefault(require("./Registration.module.css"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const cof_logo_png_1 = __importDefault(require("../../assets/pictures/cof_logo.png"));
const userAPI_1 = require("../../backendAPI/userAPI");
function Registration() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [email, setEmail] = (0, react_1.useState)("");
    const [emailVerify, setEmailVerify] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [passwordVerify, setPasswordVerify] = (0, react_1.useState)("");
    const [emailConfirmed, setEmailConfirmed] = (0, react_1.useState)(false);
    const [passwordConfirmed, setPasswordConfirmed] = (0, react_1.useState)(false);
    const [username, setUsername] = (0, react_1.useState)("");
    let newUser;
    const handleRegisterButton = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        // erst wenn beides true ist wird die anfrage gesendet
        // leider nicht in real time hinbekommen
        if (email === emailVerify) {
            setEmailConfirmed(true);
            //return;
        }
        else
            setEmailConfirmed(true);
        if (password === passwordVerify) {
            setPasswordConfirmed(true);
            //return;
        }
        else
            setPasswordConfirmed(true);
        console.log(process.env.REACT_APP_API_SERVER_URL);
        newUser = yield (0, userAPI_1.postUser)({
            email: email,
            password: password,
            username: username,
        });
        navigate("/verification");
        console.log(newUser);
        // wenn passwort und email übereinstimmen soll der user angelegt werden
        // nachdem überprüft wurde ob der username schon existiert oder nicht
    });
    return (<react_bootstrap_1.Container className={Registration_module_css_1.default.container}>
      <react_bootstrap_1.Container className={Registration_module_css_1.default.LogoContainer}>
        <react_bootstrap_1.Image src={cof_logo_png_1.default} className={Registration_module_css_1.default.Logo}/>
      </react_bootstrap_1.Container>
      <react_bootstrap_1.Form className={Registration_module_css_1.default.RegistrationForm}>
        <react_bootstrap_1.Form.Group className="mb-3">
          <react_bootstrap_1.Form.Control id="username" type="text" value={username} placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} autoFocus required/>
        </react_bootstrap_1.Form.Group>
        <react_bootstrap_1.Form.Group className="mb-3">
          <react_bootstrap_1.Form.Control id="EmailInput" type="text" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} autoFocus required/>
        </react_bootstrap_1.Form.Group>
        <react_bootstrap_1.Form.Group className="mb-3">
          <react_bootstrap_1.Form.Control id="EmailVerify" className={emailConfirmed ? "" : Registration_module_css_1.default.redBorder} type="text" value={emailVerify} placeholder="Email bestätigen" onChange={(e) => setEmailVerify(e.target.value)} autoFocus required/>
        </react_bootstrap_1.Form.Group>
        <react_bootstrap_1.Form.Group className="mb-3">
          <react_bootstrap_1.Form.Control id="PasswordInput" type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
        </react_bootstrap_1.Form.Group>
        <react_bootstrap_1.Form.Group className="mb-3">
          <react_bootstrap_1.Form.Control id="PasswordVerify" className={passwordConfirmed ? "" : Registration_module_css_1.default.redBorder} type="password" value={passwordVerify} placeholder="Password bestätigen" onChange={(e) => setPasswordVerify(e.target.value)}/>
        </react_bootstrap_1.Form.Group>
        <react_bootstrap_1.Button variant="primary" type="submit" className="w-100" onClick={(e) => handleRegisterButton(e)}>
          Register
        </react_bootstrap_1.Button>
        <react_bootstrap_1.Alert variant="secondary" className="text-center mt-3">
          Already have an account? {"\n"}
          <react_bootstrap_1.Alert.Link onClick={() => navigate("/")}>Sign in</react_bootstrap_1.Alert.Link>
        </react_bootstrap_1.Alert>
      </react_bootstrap_1.Form>
    </react_bootstrap_1.Container>);
}
//# sourceMappingURL=Registration.js.map