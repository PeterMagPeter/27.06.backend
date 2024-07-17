"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestSound;
const react_1 = __importStar(require("react"));
const howler_1 = require("howler");
function TestSound() {
    const [sfxVolume, setSfxVolume] = (0, react_1.useState)(0.3);
    const hitSound = "/sounds/hitSound.mp3";
    const playSound = (soundUrl) => {
        const sound = new howler_1.Howl({
            src: [soundUrl],
            volume: sfxVolume,
        });
        console.log("sound played", sfxVolume, soundUrl);
        sound.play();
    };
    return (<div>
      <h1>Sound Player</h1>
      <button onClick={() => playSound(hitSound)}>Play Hit Sound</button>
      <input type="range" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e) => setSfxVolume(parseFloat(e.target.value))}/>
    </div>);
}
//# sourceMappingURL=soundtest.js.map