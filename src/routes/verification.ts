import express from "express";
import { activateUserAccount } from "../services/DBService";
import { param, validationResult } from "express-validator";

export const verificationRouter = express.Router();

// Validate email adress and activate user account
verificationRouter.put('/:id', 
  param("id").isMongoId(),

  async (req, res) => {  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
  const id = req.params!.id;
  try {
    const result = await activateUserAccount(id);
    if (result) {
      res.status(200).send('Your account has been activated successfully!');
    } else {
      res.status(400).send('Failed to activate your account!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error.');
  }
});