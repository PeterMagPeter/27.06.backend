"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Winner = Winner;
const Winner_module_css_1 = __importDefault(require("./Winner.module.css"));
const firework_webp_1 = __importDefault(require("../../../assets/Gifs/firework.webp"));
const react_router_dom_1 = require("react-router-dom");
function Winner() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<>
      <div className={Winner_module_css_1.default.main}>
        <div className={Winner_module_css_1.default.firework}>
          <img src={firework_webp_1.default}></img>
        </div>
        <div className={Winner_module_css_1.default.texts}>
          <h1 className={Winner_module_css_1.default.winText}>You won!</h1>
          <h3 className={Winner_module_css_1.default.congrats}>Congratulations, Commander!</h3>
          <button onClick={() => navigate("/")} className={Winner_module_css_1.default.backButton}>Main menu</button>
        </div>
      </div>
    </>);
}
//# sourceMappingURL=Winner.js.map