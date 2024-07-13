import express from "express";
import { createUserAccount_UserService, deleteUser_UserService, getAllUsers_UserService, getUser_UserService, updateUser_UserService } from "../services/UserService";
import { UserResource, RegisterResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { ObjectId } from "mongodb";

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
userRouter.get("/all", async (_req, res, _next) => {
  const allUsers = await getAllUsers_UserService();
  res.send(allUsers);
})

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
 *           type: ObjectId
 *           format: uuid
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
userRouter.delete("/:_id",
  param("_id").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!._id;
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
 * @swagger
 * /api/user:
 *   post:
 *     summary: Creates a single user if data is valid (NOCH ZU ÄNDERN!!!)
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
 *                 minLength: 1
 *                 maxLength: 100
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               points:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000000
 *               premium:
 *                 type: boolean
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *               gameSound:
 *                 type: number
 *               music:
 *                 type: number
 *               higherLvlChallenge:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: The user was successfully created
 *       400:
 *         description: Validation errors or duplicate user
 */
/** 
 * Creates a single user if data is valid
 */
userRouter.post("/",
  body("email").isString().isEmail().isLength({ min: 1, max: 100 }),
  body("password").isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(),
  body("username").isString().isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userData = matchedData(req) as RegisterResource;
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
 * @swagger
 * /api/user/{_id}:
 *   put:
 *     summary: Updates the properties of a user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: ObjectId
 *           format: uuid
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
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
userRouter.put("/:_id",
  param("_id").isMongoId(),
  body("_id").isMongoId(),
  body("email").optional().isString().isLength({ min: 1, max: 100 }),
  body("password").optional().isString().isLength({ min: PW_MIN_LENGTH, max: PW_MAX_LENGTH }).isStrongPassword(),
  body("premium").optional().isBoolean(),
  body("gameSound").optional().isNumeric(),
  body("music").optional().isNumeric(),
  body("higherLvlChallenge").optional().isBoolean(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const id = new ObjectId(req.params!._id);
    const userData = matchedData(req) as UserResource;
    if (id !== userData._id) {
      return res.status(400).send({
        errors: [{ "location": "params", "path": "_id" },
        { "location": "body", "path": "_id" }]
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
* @swagger
* /api/user/{_id}:
*   get:
*     summary: Sends a single user
*     tags: [User]
*     parameters:
*       - in: path
*         name: _id
*         schema:
*           type: string
*           format: uuid
*         required: true
*         description: The user id
*     responses:
*       200:
*         description: The user was successfully retrieved
*       404:
*         description: The user was not found
*/

/** 
 * Sends a single user.  
 */
userRouter.get("/:_id",
  param("_id").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!._id;
  try {
    const user = await getUser_UserService(new ObjectId(id));
    res.send(user);
  } catch (error) {
    res.sendStatus(404);
    next(error);
  }
})