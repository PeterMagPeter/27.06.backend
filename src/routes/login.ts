import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";
import { UserResource } from "src/Resources";

export const loginRouter = express.Router();

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
loginRouter.get("/", async (req, res, next) => {
    try {
        const cookie = req.cookies.access_token;
        if (cookie) {
            const userResource = verifyJWT(cookie);
            res.send(userResource);
        } else {
            res.clearCookie("ocean-combat_access_token");
            res.status(400).send(false);
        }
    } catch (error) {
        res.clearCookie("ocean-combat_access_token");
        res.status(400).send(false);
        next(error);
    }
});

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
loginRouter.post("/",
    body("email").isString().isLength({ min: 1, max: 100 }),
    body("password").isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Extract email from req as additional factor, to make cookie name unique
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            const data = matchedData(req);
            const jwtString = await verifyPasswordAndCreateJWT(email, password);
            const login = verifyJWT(jwtString);
            // Exp. needs to be multiplied by 1000 to convert secs ==> millisec [Needed by JavaScript date object]
            const exp = new Date(login.exp * 1000);
            res.cookie("ocean-combat_access_token", jwtString, { 
                httpOnly: true, secure: true, sameSite: "none", expires: exp 
            });
            res.status(201).send(login);
        } catch (error) {
            res.clearCookie("ocean-combat_access_token");
            res.status(401).send();
            next(error);
        }
    });

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
loginRouter.delete("/", async (req, res, next) => {
    // Clear cookie [This code part has been written by AI]
    res.clearCookie("ocean-combat_access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.status(204).send();
});

export default loginRouter;
