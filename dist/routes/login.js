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
exports.loginRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const JWTService_1 = require("../services/JWTService");
exports.loginRouter = express_1.default.Router();
/**
 * @swagger
 * /api/login:
 *   get:
 *     summary: Get a user based on JWT cookie
 *     tags: [Login]
 *     responses:
 *       200:
 *         description: The user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid or missing token
 */
exports.loginRouter.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies.access_token;
        if (cookie) {
            const userResource = (0, JWTService_1.verifyJWT)(cookie);
            res.send(userResource);
        }
        else {
            res.clearCookie("ocean-combat_access_token");
            res.status(400).send(false);
        }
    }
    catch (error) {
        res.clearCookie("ocean-combat_access_token");
        res.status(400).send(false);
        next(error);
    }
}));
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user and set JWT cookie
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               password:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: The user was successfully logged in
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 */
exports.loginRouter.post("/", (0, express_validator_1.body)("email").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("password").isLength({ min: 1, max: 100 }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() });
    }
    // Extract email from req as additional factor, to make cookie name unique
    const email = req.body.email;
    try {
        const data = (0, express_validator_1.matchedData)(req);
        const jwtString = yield (0, JWTService_1.verifyPasswordAndCreateJWT)(data.email, data.password);
        const login = (0, JWTService_1.verifyJWT)(jwtString);
        // Exp. needs to be multiplied by 1000 to convert secs ==> millisec [Needed by JavaScript date object]
        const exp = new Date(login.exp * 1000);
        res.cookie("ocean-combat_access_token", jwtString, {
            httpOnly: true, secure: true, sameSite: "none", expires: exp
        });
        res.status(201).send(login);
    }
    catch (error) {
        res.clearCookie("ocean-combat_access_token");
        res.status(401).send();
        next(error);
    }
}));
/**
 * @swagger
 * /api/login:
 *   delete:
 *     summary: Log out a user by clearing JWT cookie
 *     tags: [Login]
 *     responses:
 *       204:
 *         description: The user was successfully logged out
 */
exports.loginRouter.delete("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Clear cookie [This code part has been written by AI]
    res.clearCookie("ocean-combat_access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.status(204).send();
}));
exports.default = exports.loginRouter;
//# sourceMappingURL=login.js.map