"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlineMatchModel = void 0;
const mongoose_1 = require("mongoose");
const Resources_1 = require("../Resources");
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
    createdAt: { type: Date, default: Date.now() },
    gamestatus: { type: String, default: Resources_1.Gamestatus.Waiting },
});
exports.OnlineMatchModel = (0, mongoose_1.model)('OnlineMatch', onlineMatchModelSchema);
//# sourceMappingURL=OnlineMatchModel.js.map