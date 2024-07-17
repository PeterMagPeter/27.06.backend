"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loser = Loser;
const Loser_module_css_1 = __importDefault(require("./Loser.module.css"));
const sad_cat_webp_1 = __importDefault(require("../../../assets/Gifs/sad_cat.webp"));
const react_router_dom_1 = require("react-router-dom");
function Loser() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (<>
      <div className={Loser_module_css_1.default.main}>
        <div className={Loser_module_css_1.default.cat}>
          <img src={sad_cat_webp_1.default}></img>
        </div>
        <div className={Loser_module_css_1.default.texts}>
          <h1 className={Loser_module_css_1.default.loser}>Loser</h1>
          <h2 className={Loser_module_css_1.default.subs}>What did you expect?</h2>
          <h3 className={Loser_module_css_1.default.subs}>Embarassing...</h3>
          <br />
          <button onClick={() => navigate("/")} className={Loser_module_css_1.default.backButton}>Be gone</button>
        </div>
      </div>
    </>);
}
//# sourceMappingURL=Loser.js.map