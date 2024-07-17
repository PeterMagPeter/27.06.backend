"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeout = Timeout;
const Timeout_module_css_1 = __importDefault(require("./Timeout.module.css"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
function Timeout() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    navigate("/");
    return (<>
      <div className={Timeout_module_css_1.default.main}>
        <div className={Timeout_module_css_1.default.texts}>
          <h1>Time is up!</h1>
          <br />
          <h3>Thank you for playing.</h3>
          <h4>Please fill out our survey.</h4>
        </div>
        <react_bootstrap_1.Button onClick={() => navigate("/")}>Go back</react_bootstrap_1.Button>
      </div>
    </>);
}
//# sourceMappingURL=Timeout.js.map