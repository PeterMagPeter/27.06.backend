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
exports.OnlineMatchModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const onlineMatchModelSchema = new mongoose_1.Schema({
    roomId: { type: String, required: true },
    privateMatch: { type: Boolean, required: true, default: false },
    gameMap: { type: String, required: true },
    password: { type: String },
    superWeapons: { type: Boolean, required: true },
    shotTimer: { type: Number, required: true },
    gameMode: { type: String, required: true },
    hostName: { type: String, required: true },
    players: [{ type: String }],
    //players: { type: Schema.Types.ObjectId, ref: 'User' },
    maxPlayers: { type: Number },
    createdAt: { type: Date, default: Date.now }
});
exports.OnlineMatchModel = mongoose_1.default.model('OnlineMatch', onlineMatchModelSchema);
//# sourceMappingURL=OnlineMatchModel.js.map