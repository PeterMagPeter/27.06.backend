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
exports.login = void 0;
const UserModel_1 = require("../model/UserModel");
const DBService_1 = require("./DBService");
/**
 * Checks name and password. If successful, true is returned, otherwise false
 */
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        // Try to find user in db
        const dbUser = yield (0, DBService_1.getUserByMail)(email);
        // Check, if user account is already activated
        if (dbUser && !dbUser.verified) {
            return false;
        }
        // Create user (just for use of isCorrectPassword() from user schema)
        let user;
        if (dbUser !== null) {
            user = yield UserModel_1.User.create(Object.assign({}, dbUser));
        }
        // Check password
        const pwValid = yield (user === null || user === void 0 ? void 0 : user.isCorrectPassword(password));
        if (!pwValid)
            return false;
        else
            return { id: user === null || user === void 0 ? void 0 : user.id };
    });
}
exports.login = login;
//# sourceMappingURL=AuthenticationService.js.map