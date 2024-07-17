import express from "express";
import { activateUserAccount } from "../services/DBService";
import { param, validationResult } from "express-validator";
import { ObjectId } from "mongodb";

export const verificationRouter = express.Router();

/**
 * @swagger
 * /api/verify/{id}:
 *   get:
 *     summary: Validate email address and activate user account
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: Your account has been activated successfully!
 *       400:
 *         description: Failed to activate your account or validation errors
 *       500:
 *         description: Internal server error
 */
verificationRouter.get('/:_id',
  param("_id").isMongoId(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params?._id;
    console.log("params.id " + id)
    try {
      const result = await activateUserAccount(new ObjectId(id));
      if (result) {
        res.status(200).send('Your account has been activated successfully!');
      } else {
        res.status(400).send('Failed to activate your account!');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error.');
    }
  }
);

export default verificationRouter;
