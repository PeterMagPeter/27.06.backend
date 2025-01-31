"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guest = void 0;
const mongoose_1 = require("mongoose");
;
// Guest schema
const guestSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    //picture: {type: String, default: ""},     NICE TO HAVE
    level: { type: Number, default: 1 },
    gameSound: { type: Number, default: 0.3 },
    music: { type: Number, default: 0.3 },
    skin: { type: String, default: "standard" }
});
exports.Guest = (0, mongoose_1.model)("Guest", guestSchema);
//# sourceMappingURL=GuestModel.js.map