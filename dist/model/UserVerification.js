"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVerification = void 0;
const mongoose_1 = require("mongoose");
;
const userVerificationSchema = new mongoose_1.Schema({
    userID: { type: String, required: true, unique: true },
    // uniqueString: {type: String, required: true},
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
});
exports.UserVerification = (0, mongoose_1.model)("UserVerification", userVerificationSchema);
//# sourceMappingURL=UserVerification.js.map