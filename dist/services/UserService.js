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
exports.getAllUsers_UserService = exports.deleteUser_UserService = exports.getUser_UserService = exports.updateUser_UserService = exports.createUserAccount_UserService = void 0;
const UserModel_1 = require("../model/UserModel");
const DBService_1 = require("./DBService");
/**
 * Create user with data from UserResource and write it into db
 */
function createUserAccount_UserService(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield UserModel_1.User.create(Object.assign({}, userRes));
        // Write user into db
        try {
            return yield (0, DBService_1.registerUser)(user);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.createUserAccount_UserService = createUserAccount_UserService;
/**
 * Identify and update user by ID with the given UserResource
 * If no id is provided or user couldn't be found, an error is thrown.
 */
function updateUser_UserService(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userRes._id) {
            throw new Error("Please provide an user to update!");
        }
        try {
            return yield (0, DBService_1.updateUserData)(userRes);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.updateUser_UserService = updateUser_UserService;
/**
 * Get and return user by mail.
 * If user couldn't be found an error is thrown.
 */
function getUser_UserService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("Please provide an email to search for!");
        }
        try {
            return yield (0, DBService_1.getUserById)(userId);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getUser_UserService = getUser_UserService;
/**
 * Identify user by mail.
 * If user couldn't be found an error is thrown.
 */
function deleteUser_UserService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("Please provide an email to search for!");
        }
        try {
            const result = yield getUser_UserService(userId);
            if (result !== null) {
                return yield (0, DBService_1.deleteUserById)(userId);
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.deleteUser_UserService = deleteUser_UserService;
/**
 * Returns all users stored in DB.
 * Omits privacy related data, i.e. email, id and member status
 */
function getAllUsers_UserService() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield (0, DBService_1.getAllUsers)();
        let userResources = [];
        userResources = users.map(user => ({
            _id: user._id,
            email: user.email,
            username: user.username,
            points: user.points,
            premium: user.premium,
            level: user.level,
            gameSound: user.gameSound,
            music: user.music,
            higherLvlChallenge: user.higherLvlChallenge,
            verified: user.verified,
            verificationTimer: user.verificationTimer
        }));
        return userResources;
    });
}
exports.getAllUsers_UserService = getAllUsers_UserService;
//# sourceMappingURL=UserService.js.map