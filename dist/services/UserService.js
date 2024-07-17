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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserAccount_UserService = createUserAccount_UserService;
exports.updateUser_UserService = updateUser_UserService;
exports.getUser_UserService = getUser_UserService;
exports.deleteUser_UserService = deleteUser_UserService;
exports.hashPassword = hashPassword;
exports.isCorrectPassword = isCorrectPassword;
exports.getAllUsers_UserService = getAllUsers_UserService;
const DBService_1 = require("./DBService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Create user with data from UserResource and write it into db
 */
function createUserAccount_UserService(registerRes) {
    return __awaiter(this, void 0, void 0, function* () {
        // Hash password and write user into db
        try {
            let result = yield (0, DBService_1.registerUser)(registerRes);
            return result;
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
/**
 * @param password is going to be hashed to avoid that it is saved in plaintext
 * @returns the hashed password incl. salt that has been used to hash password
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
        return hashedPassword;
    });
}
/**
 * @param email is used to search for a user in the db
 * @param password is used to compare if the given input data matches the found user and it's password
 * @returns result of comparison
 */
function isCorrectPassword(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = false;
        let userByMail = yield (0, DBService_1.getUserByMail)(email);
        if (userByMail !== null && userByMail.password) {
            const correct = yield bcryptjs_1.default.compare(password, userByMail.password);
            if (correct) {
                return true;
            }
        }
        return result;
    });
}
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
            verificationTimer: user.verificationTimer,
            skin: user.skin
        }));
        return userResources;
    });
}
//# sourceMappingURL=UserService.js.map