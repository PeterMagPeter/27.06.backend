import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";

export const loginRouter = express.Router();

//get a user
loginRouter.get("/", async (req, res, next) => {
    try {
        const cookie = req.cookies.access_token;
        if (cookie) {
            const userResource = verifyJWT(cookie);
            res.send(userResource);
        }
        else {
            res.clearCookie("ocean-combat_access_token");
            res.status(400).send(false);
        }
    } catch (error) {
        res.clearCookie("ocean-combat_access_token");
        res.status(400).send(false);
        next(error);
    }
})

//post cookie
loginRouter.post("/",
    body("email").isString().isLength({ min: 1, max: 100 }),
    body("password").isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(401).json({ errors: errors.array() })
        }
        // Extract email from req as additional factor, to make cookie name unique
        const email: string = req.body.email
        try {
            const data = matchedData(req);
            const jwtString = await verifyPasswordAndCreateJWT(data.email, data.password);
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
 })

//delete cookie
loginRouter.delete("/", async (req, res, next) => {
    // Extract email from req to find unique cookie name
    // const email = req.body.email;
    // if (!email) {
    //     return res.status(400).send({ error: "Email is required!" });
    // }

    // Clear cookie [This code part has been written by AI]
    res.clearCookie("ocean-combat_access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.status(204).send();
})