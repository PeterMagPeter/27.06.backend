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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const DBService_1 = require("./DBService");
const UserService_1 = require("./UserService");
/**
 * Checks name and password. If successful, true is returned, otherwise false
 */
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        // Try to find user in db
        const dbUser = yield (0, DBService_1.getUserByMail)(email);
        // Check, if user exists, if account is already activated and if credentials are correct
        if (dbUser !== null && dbUser.verified) {
            const passwordValid = yield (0, UserService_1.isCorrectPassword)(email, password);
            if (passwordValid) {
                return { id: dbUser === null || dbUser === void 0 ? void 0 : dbUser._id.toString() };
            }
        }
        return false;
    });
}
//# sourceMappingURL=AuthenticationService.js.map