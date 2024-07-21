import express from "express";
import { createGuest, deleteGuest, getGuest, updateGuest } from "../services/GuestService";
import { GuestResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";

export const guestRouter = express.Router();

const NAME_MIN_LENGTH: number = 3;
const NAME_MAX_LENGTH: number = 30;
const POINTS_MIN: number = 0;
const POINTS_MAX: number = 1_000_000;
const LVL_MIN: number = 1;
const LVL_MAX: number = 1_000;

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
/**
 * Default to 404 if someone tries to create multiple guests
 */ 
guestRouter.post("/all", async (_req, res, _next) => {
  res.sendStatus(403);
})

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
guestRouter.put("/all", async (_req, res, _next) => {
  res.sendStatus(403);
})

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
guestRouter.delete("/all", async (_req, res, _next) => {
  res.sendStatus(403);
})

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
guestRouter.get("/all", async (_req, res, _next) => {
  res.sendStatus(403);
})

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
guestRouter.delete("/:_id",
  param("_id").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params!._id;
    try {
      await deleteGuest(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(404);
      next(error);
    }
  }
)

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
guestRouter.post("/",
  body("username").isString().isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH }),
  body("points").optional().isNumeric().isInt({ min: POINTS_MIN, max: POINTS_MAX }),
  body("level").optional().isNumeric().isInt({ min: LVL_MIN, max: LVL_MAX }),
  body("gameSound").optional().isNumeric(),
  body("music").optional().isNumeric(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const guestData = matchedData(req) as GuestResource;
    try {
      const create = await createGuest(guestData);
      res.status(201).send(create);
      return;
    } catch (error) {
      const e = error as Error;
      if (e.message.startsWith("E11000 duplicate key")) {
        return res.status(400).send({
          errors: [{
            location: "body",
            msg: "User with that name already exists!",
            path: "username",
            value: guestData.username
          }]
        })
      }
    }
  }
)

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
guestRouter.put("/:id",
  param("id").isMongoId(),
  body("id").isMongoId(),
  body("points").optional().isNumeric().isInt({ min: POINTS_MIN, max: POINTS_MAX }),
  body("level").optional().isNumeric().isInt({ min: LVL_MIN, max: LVL_MAX }),
  body("gameSound").optional().isNumeric(),
  body("music").optional().isNumeric(),
  body("higherLvlChallenge").optional().isBoolean(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params!.id;
    const guestData = matchedData(req) as GuestResource;
    if (id !== guestData.id) {
      return res.status(400).send({
        errors: [{ "location": "params", "path": "_id" },
        { "location": "body", "path": "_id" }]
      });
    }
    try {
      const update = await updateGuest(guestData);
      res.send(update);
    } catch (error) {
      res.status(404);
      next(error);
    }
  }
)

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
guestRouter.get("/:_id", 
  async (req, res, next) => {
  try {
    const id = req.params._id;
    const guest = await getGuest(id);
    res.send(guest);
  } catch (error) {
    res.sendStatus(404);
    next(error);
  }
})

export default guestRouter;
