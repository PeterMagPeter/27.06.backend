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
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
const UserModel_1 = require("../model/UserModel");
const DBService_1 = require("./DBService");
/**
 * Create user with data from UserResource and write it into db
 */
function createUser(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield UserModel_1.User.create({
            email: userRes.email,
            password: userRes.password,
            username: userRes.username,
            points: userRes.points,
            premium: userRes.premium,
            level: userRes.level,
            gameSound: userRes.gameSound,
            music: userRes.music,
            higherLvlChallenge: userRes.higherLvlChallenge
        });
        // Write user into db
        try {
            return yield (0, DBService_1.registerUser)(user);
        }
        catch (error) {
            throw error;
        }
    });
}
/**
 * Identify and update user by ID with the given UserResource
 * If no id is provided or user couldn't be found, an error is thrown.
 */
function updateUser(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userRes.id) {
            throw new Error("Please provide an user to update!");
        }
        //TODO Implement additional update progress via userSchema.pre(["updateOne", 
        //"findOneAndUpdate", "updateMany"], async function ()
        try {
            return yield (0, DBService_1.updateUserData)(userRes);
        }
        catch (error) {
            throw error;
        }
    });
}
/**
 * Get and return user by mail.
 * If user couldn't be found an error is thrown.
 */
function getUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!email) {
            throw new Error("Please provide an email to search for!");
        }
        try {
            return yield (0, DBService_1.getUserByMail)(email);
        }
        catch (error) {
            throw error;
        }
    });
}
/**
 * Identify user by mail.
 * If user couldn't be found an error is thrown.
 */
function deleteUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!email) {
            throw new Error("Please provide an email to search for!");
        }
        try {
            const result = yield getUser(email);
            if (result !== null) {
                return yield (0, DBService_1.deleteUserByMail)(email);
            }
        }
        catch (error) {
            throw error;
        }
    });
}
/**
 * Returns all users stored in DB.
 * Omits privacy related data, i.e. email, id and member status
 */
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield UserModel_1.User.find({}).exec();
        const userResources = users.map(user => ({
            username: user.username,
            points: user.points,
            level: user.level,
            active: user.active
        }));
        return userResources;
    });
}
//# sourceMappingURL=UserService.js.map