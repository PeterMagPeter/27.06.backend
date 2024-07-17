"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WaitForVerification;
const WaitForVerification_module_css_1 = __importDefault(require("./WaitForVerification.module.css"));
const react_router_dom_1 = require("react-router-dom");
const cof_logo_png_1 = __importDefault(require("../../assets/pictures/cof_logo.png"));
const react_bootstrap_1 = require("react-bootstrap");
function WaitForVerification() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<div className={WaitForVerification_module_css_1.default.verificationContainer}>
    <div className={WaitForVerification_module_css_1.default.verificationImageContainer}>
      <img className={WaitForVerification_module_css_1.default.verificationImage} src={cof_logo_png_1.default}/>
    </div>
    <div className={WaitForVerification_module_css_1.default.verificationTextContainer}>
      <h1 className={WaitForVerification_module_css_1.default.verificationTitle}>Your registration was successful.</h1>
      <h3 className={WaitForVerification_module_css_1.default.verificationText}>Please check your e-mail inbox to verify your account.</h3>
      <react_bootstrap_1.Button className={WaitForVerification_module_css_1.default.verificationButton} onClick={() => navigate("/")}>Login</react_bootstrap_1.Button>
    </div>
  </div>);
}
//# sourceMappingURL=WaitForVerfication.js.map