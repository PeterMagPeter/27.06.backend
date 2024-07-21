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
const mongodb_1 = require("mongodb");
exports.userRouter = express_1.default.Router();
const EMAIL_MIN_LENGTH = 5;
const EMAIL_MAX_LENGTH = 45;
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;
const PW_MIN_LENGTH = 8;
const PW_MAX_LENGTH = 100;
/**
 * @swagger
 * /api/user/all:
 *   post:
 *     summary: Attempt to create multiple users (not allowed)
 *     tags: [User]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
/**
 * Default to 403 if someone tries to create multiple users
 */
exports.userRouter.post("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/user/all:
 *   put:
 *     summary: Attempt to update multiple users (not allowed)
 *     tags: [User]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
/**
 * Default to 403 if someone tries to update all users
 */
exports.userRouter.put("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/user/all:
 *   delete:
 *     summary: Attempt to delete multiple users (not allowed)
 *     tags: [User]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
/**
 * Default to 403 if someone tries to delete all users
 */
exports.userRouter.delete("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/user/all:
 *   get:
 *     summary: Sends all users (getAllUsers_UserService() ignores to send email addresses)
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: No users found
 */
/**
 * Sends all users (getAlleUser() ignores to send email adresses)
 */
exports.userRouter.get("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/user/{_id}:
 *   delete:
 *     summary: Deletes a single user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The user id
 *     responses:
 *       204:
 *         description: The user was successfully deleted
 *       400:
 *         description: Validation errors
 *       404:
 *         description: The user was not found
 */
/**
 * Delets a single user
 */
exports.userRouter.delete("/:_id", (0, express_validator_1.param)("_id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = new mongodb_1.ObjectId(req.params._id);
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
 * @swagger
 * /api/user:
 *   post:
 *     summary: Creates a single user if data is valid
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 5
 *                 maxLength: 45
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *     responses:
 *       201:
 *         description: The user was successfully created
 *       400:
 *         description: Validation errors or duplicate user
 */
/**
 * Creates a single user if data is valid
 */
exports.userRouter.post("/", (0, express_validator_1.body)("email").isString().isEmail().isLength({ min: EMAIL_MIN_LENGTH, max: EMAIL_MAX_LENGTH }), (0, express_validator_1.body)("password").isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(), (0, express_validator_1.body)("username").isString().isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
 * @swagger
 * /api/user/{_id}:
 *   put:
 *     summary: Updates the properties of a user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 format: mongoId
 *               email:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 45
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *               premium:
 *                 type: boolean
 *               gameSound:
 *                 type: number
 *               music:
 *                 type: number
 *               higherLvlChallenge:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The user was successfully updated
 *       400:
 *         description: Validation errors
 *       404:
 *         description: The user was not found
 */
/**
 * Updates the properties of a user
 */
exports.userRouter.put("/:_id", (0, express_validator_1.param)("_id").isMongoId(), (0, express_validator_1.body)("_id").isMongoId(), (0, express_validator_1.body)("email").optional().isString().isLength({ min: EMAIL_MIN_LENGTH, max: EMAIL_MAX_LENGTH }), (0, express_validator_1.body)("password").optional().isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(), (0, express_validator_1.body)("premium").optional().isBoolean(), (0, express_validator_1.body)("gameSound").optional().isNumeric(), (0, express_validator_1.body)("music").optional().isNumeric(), (0, express_validator_1.body)("higherLvlChallenge").optional().isBoolean(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params._id;
    const userData = (0, express_validator_1.matchedData)(req);
    if (id !== userData._id) {
        return res.status(400).send({
            errors: [{ "location": "params", "path": "_id" },
                { "location": "body", "path": "_id" }]
        });
    }
    try {
        const update = yield (0, UserService_1.updateUser_UserService)(Object.assign(Object.assign({}, userData), { _id: new mongodb_1.ObjectId(id) }));
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
        if (e.message.startsWith("Username is unique")) {
            return res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "Username can't be changed!",
                        path: "username",
                        value: userData.username
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
 * @swagger
 * /api/user/{_id}:
 *   get:
 *     summary: Retrieves a single user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user was successfully retrieved
 *       400:
 *         description: Validation errors
 *       404:
 *         description: The user was not found
 */
/**
 * Retrieves a single user
 */
exports.userRouter.get("/:_id", (0, express_validator_1.param)("_id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = new mongodb_1.ObjectId(req.params._id);
    try {
        const user = yield (0, UserService_1.getUser_UserService)(id);
        res.send(user);
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
    }
}));
exports.default = exports.userRouter;
//# sourceMappingURL=user.js.map