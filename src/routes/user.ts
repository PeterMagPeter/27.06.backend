import express from "express";
import { createUserAccount_UserService, deleteUser_UserService, getAllUsers_UserService, getUser_UserService, updateUser_UserService } from "../services/UserService";
import { UserResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";

export const userRouter = express.Router();

const NAME_MIN_LENGTH: number = 3;
const NAME_MAX_LENGTH: number = 30;
const POINTS_MIN: number = 0;
const POINTS_MAX: number = 1_000_000;
const PW_MIN_LENGTH: number = 8;
const PW_MAX_LENGTH: number = 100;
const LVL_MIN: number = 1;
const LVL_MAX: number = 1_000;

/**
 * Default to 404 if someone tries to create multiple users
 */ 
userRouter.post("/all", async (_req, res, _next) => {
  res.sendStatus(404);
})

/**
 * Default to 404 if someone tries to update all users
 */ 
userRouter.put("/all", async (_req, res, _next) => {
  res.sendStatus(404);
})

/**
 * Default to 404 if someone tries to delete all users
 */ 
userRouter.delete("/all", async (_req, res, _next) => {
  res.sendStatus(404);
})

/** 
 * Sends all users (getAlleUser() ignores to send email adresses)
 */
userRouter.get("/all", async (_req, res, _next) => {
  const allUsers = await getAllUsers_UserService();
  res.send(allUsers);
})

/** 
 * Delets a single user
 */
userRouter.delete("/:id",
  param("id").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!.id;
    try {
      await deleteUser_UserService(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(404);
      next(error);
    }
  }
)

/** 
 * Creates a single user if data is valid
 */
userRouter.post("/",
  body("email").isString().isEmail().isLength({ min: 1, max: 100 }),
  body("password").isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(),
  body("username").isString().isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH }),
  body("points").optional().isNumeric().isInt({ min: POINTS_MIN, max: POINTS_MAX }),
  body("premium").optional().isBoolean(),
  body("level").optional().isNumeric().isInt({ min: LVL_MIN, max: LVL_MAX }),
  body("gameSound").optional().isBoolean(),
  body("music").optional().isBoolean(),
  body("higherLvlChallenge").optional().isBoolean(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userData = matchedData(req) as UserResource;
    try {
      // Create user with schema & write it into the db
      const user = await createUserAccount_UserService(userData);  
      res.status(201).send(user);
      return;   // To prevent function continues in catch-block, when everything was fine.
    } catch (error) {
      const e = error as Error;
      if (e.message.startsWith("Email already registered")) {
        return res.status(400).send({
          errors: [{
            location: "body",
            msg: "Email already exists!",
            path: "email",
            value: userData.email
          }]
        })
      }
      if (e.message.startsWith("Username already registered")) {
        return res.status(400).send({
          errors: [{
            location: "body",
            msg: "Username already exists!",
            path: "username",
            value: userData.username
          }]
        })
      }
      res.status(400);
      next(error);
    }
  }
)

/** 
 * Updates the properties of a user  
 */
userRouter.put("/:id",
  param("id").isMongoId(),
  body("id").isMongoId(),
  body("email").optional().isString().isLength({ min: 1, max: 100 }),
  body("password").optional().isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(),
  body("premium").optional().isBoolean(),
  body("gameSound").optional().isBoolean(),
  body("music").optional().isBoolean(),
  body("higherLvlChallenge").optional().isBoolean(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params!.id;
    const userData = matchedData(req) as UserResource;
    if (id !== userData._id) {
      return res.status(400).send({
        errors: [{ "location": "params", "path": "id" },
        { "location": "body", "path": "id" }]
      });
    }
    try {
      const update = await updateUser_UserService(userData);
      res.send(update);
    } catch (error) {
      const e = error as Error;
      if (e.message.startsWith("Mail address already in use!")) {
        return res.status(400).send({
          errors: [{
            location: "body",
            msg: "Mail address already in use!",
            path: "email",
            value: userData.email
          }]
        })
      }
      if (e.message.startsWith("Couldn't find user to update!")) {
        return res.status(400).send({
          errors: [{
            location: "body",
            msg: "Couldn't find user to update!",
            path: "username",
            value: userData.username
          }]
        })
      }
      res.status(404);
      next(error);
    }
  }
)

/** 
 * Sends a single user.  
 */
userRouter.get("/:id",
  param("id").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!.id;
  try {
    const user = await getUser_UserService(id);
    res.send(user);
  } catch (error) {
    res.sendStatus(404);
    next(error);
  }
})