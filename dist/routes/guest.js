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
exports.guestRouter = void 0;
const express_1 = __importDefault(require("express"));
const GuestService_1 = require("../services/GuestService");
const express_validator_1 = require("express-validator");
exports.guestRouter = express_1.default.Router();
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;
const POINTS_MIN = 0;
const POINTS_MAX = 1000000;
const LVL_MIN = 1;
const LVL_MAX = 1000;
/**
 * @swagger
 * /api/guest/all:
 *   post:
 *     summary: Attempt to create multiple guests (not allowed)
 *     tags: [Guest]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
exports.guestRouter.post("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/guest/all:
 *   put:
 *     summary: Attempt to update all guests (not allowed)
 *     tags: [Guest]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
/**
 * Default to 404 if someone tries to update all guests
 */
exports.guestRouter.put("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/guest/all:
 *   delete:
 *     summary: Attempt to delete all guests (not allowed)
 *     tags: [Guest]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
/**
 * Default to 404 if someone tries to delete all guests
 */
exports.guestRouter.delete("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/guest/all:
 *   get:
 *     summary: Attempt to get all guests (not allowed)
 *     tags: [Guest]
 *     responses:
 *       403:
 *         description: Operation not allowed
 */
/**
 * Default to 404 if someone tries to get all guests
 * Because guests are not supposed to show in the leaderboard
 */
exports.guestRouter.get("/all", (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(403);
}));
/**
 * @swagger
 * /api/guest/{id}:
 *   delete:
 *     summary: Deletes a single guest
 *     tags: [Guest]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The guest id
 *     responses:
 *       204:
 *         description: The guest was successfully deleted
 *       400:
 *         description: Invalid id format
 *       404:
 *         description: The guest was not found
 */
exports.guestRouter.delete("/:_id", (0, express_validator_1.param)("_id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params._id;
    try {
        yield (0, GuestService_1.deleteGuest)(id);
        res.sendStatus(204);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
/**
 * @swagger
 * /api/guest:
 *   post:
 *     summary: Creates a single guest if data is valid
 *     tags: [Guest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               points:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000000
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *               gameSound:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               music:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *             required:
 *               - username
 *     responses:
 *       201:
 *         description: The guest was successfully created
 *       400:
 *         description: Validation errors or duplicate user
 */
exports.guestRouter.post("/", (0, express_validator_1.body)("username").isString().isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH }), (0, express_validator_1.body)("points").optional().isNumeric().isInt({ min: POINTS_MIN, max: POINTS_MAX }), (0, express_validator_1.body)("level").optional().isNumeric().isInt({ min: LVL_MIN, max: LVL_MAX }), (0, express_validator_1.body)("gameSound").optional().isNumeric(), (0, express_validator_1.body)("music").optional().isNumeric(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const guestData = (0, express_validator_1.matchedData)(req);
    try {
        const create = yield (0, GuestService_1.createGuest)(guestData);
        res.status(201).send(create);
        return;
    }
    catch (error) {
        const e = error;
        if (e.message.startsWith("E11000 duplicate key")) {
            return res.status(400).send({
                errors: [{
                        location: "body",
                        msg: "User with that name already exists!",
                        path: "username",
                        value: guestData.username
                    }]
            });
        }
    }
}));
/**
 * @swagger
 * /api/guest/{id}:
 *   put:
 *     summary: Updates the properties of a guest
 *     tags: [Guest]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The guest id
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
 *               points:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000000
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *               gameSound:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               music:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               higherLvlChallenge:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The guest was successfully updated
 *       400:
 *         description: Validation errors
 *       404:
 *         description: The guest was not found
 */
exports.guestRouter.put("/:id", (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("points").optional().isNumeric().isInt({ min: POINTS_MIN, max: POINTS_MAX }), (0, express_validator_1.body)("level").optional().isNumeric().isInt({ min: LVL_MIN, max: LVL_MAX }), (0, express_validator_1.body)("gameSound").optional().isNumeric(), (0, express_validator_1.body)("music").optional().isNumeric(), (0, express_validator_1.body)("higherLvlChallenge").optional().isBoolean(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    const guestData = (0, express_validator_1.matchedData)(req);
    if (id !== guestData.id) {
        return res.status(400).send({
            errors: [{ "location": "params", "path": "_id" },
                { "location": "body", "path": "_id" }]
        });
    }
    try {
        const update = yield (0, GuestService_1.updateGuest)(guestData);
        res.send(update);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
/**
 * @swagger
 * /api/guest/{id}:
 *   get:
 *     summary: Retrieves a single guest
 *     tags: [Guest]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The guest id
 *     responses:
 *       200:
 *         description: The guest was successfully retrieved
 *       404:
 *         description: The guest was not found
 */
exports.guestRouter.get("/:_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params._id;
        const guest = yield (0, GuestService_1.getGuest)(id);
        res.send(guest);
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
    }
}));
exports.default = exports.guestRouter;
//# sourceMappingURL=guest.js.map