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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const UserService_1 = require("../services/UserService");
const express_validator_1 = require("express-validator");
exports.userRouter = express_1.default.Router();
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;
const POINTS_MIN = 0;
const POINTS_MAX = 1000000;
const PW_MIN_LENGTH = 8;
const PW_MAX_LENGTH = 100;
const LVL_MIN = 1;
const LVL_MAX = 1000;
/**
 * Default to 404 if someone tries to create multiple users
 */
exports.userRouter.post("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(404);
}));
/**
 * Default to 404 if someone tries to update all users
 */
exports.userRouter.put("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(404);
}));
/**
 * Default to 404 if someone tries to delete all users
 */
exports.userRouter.delete("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(404);
}));
/**
 * Sends all users (getAlleUser() ignores to send email adresses)
 */
exports.userRouter.get("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield (0, UserService_1.getAllUsers_UserService)();
    res.send(allUsers);
}));
/**
 * Delets a single user
 */
exports.userRouter.delete("/:id", (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        yield (0, UserService_1.deleteUser_UserService)(id);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
/**
 * Creates a single user if data is valid
 */
exports.userRouter.post("/", (0, express_validator_1.body)("email").isString().isEmail().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("password").isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(), (0, express_validator_1.body)("username").isString().isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH }), (0, express_validator_1.body)("points").optional().isNumeric().isInt({ min: POINTS_MIN, max: POINTS_MAX }), (0, express_validator_1.body)("premium").optional().isBoolean(), (0, express_validator_1.body)("level").optional().isNumeric().isInt({ min: LVL_MIN, max: LVL_MAX }), (0, express_validator_1.body)("gameSound").optional().isBoolean(), (0, express_validator_1.body)("music").optional().isBoolean(), (0, express_validator_1.body)("higherLvlChallenge").optional().isBoolean(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const userData = (0, express_validator_1.matchedData)(req);
    try {
        // Create user with schema & write it into the db
        const user = yield (0, UserService_1.createUserAccount_UserService)(userData);
        res.status(201).send(user);
        return; // To prevent function continues in catch-block, when everything was fine.
    }
    catch (error) {
        const e = error;
        if (e.message.startsWith("Email already registered")) {
            return res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Email already exists!",
                        path: "email",
                        value: userData.email
                    }]
            });
        }
        if (e.message.startsWith("Username already registered")) {
            return res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Username already exists!",
                        path: "username",
                        value: userData.username
                    }]
            });
        }
        res.status(400);
        next(error);
    }
}));
/**
 * Updates the properties of a user
 */
exports.userRouter.put("/:id", (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("email").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("password").optional().isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(), (0, express_validator_1.body)("premium").optional().isBoolean(), (0, express_validator_1.body)("gameSound").optional().isBoolean(), (0, express_validator_1.body)("music").optional().isBoolean(), (0, express_validator_1.body)("higherLvlChallenge").optional().isBoolean(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    const userData = (0, express_validator_1.matchedData)(req);
    if (id !== userData.id) {
        return res.status(400).send({
            errors: [{ "location": "params", "path": "id" },
                { "location": "body", "path": "id" }]
        });
    }
    try {
        const update = yield (0, UserService_1.updateUser_UserService)(userData);
        res.send(update);
    }
    catch (error) {
        const e = error;
        if (e.message.startsWith("Mail address already in use!")) {
            return res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Mail address already in use!",
                        path: "email",
                        value: userData.email
                    }]
            });
        }
        if (e.message.startsWith("Couldn't find user to update!")) {
            return res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Couldn't find user to update!",
                        path: "username",
                        value: userData.username
                    }]
            });
        }
        res.status(404);
        next(error);
    }
}));
/**
 * Sends a single user.
 */
exports.userRouter.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield (0, UserService_1.getUser_UserService)(id);
        res.send(user);
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
    }
}));
//# sourceMappingURL=user.js.map