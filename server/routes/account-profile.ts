import express from "express";
import type { RequestHandler } from "express";
import { db } from "../db/client.js";
import {
  authenticate,
  getAuthenticatedUser,
} from "../middleware/authorization.js";
import { accountProfileValidation } from "../middleware/validation.js";

export const accountProfileRouter = express.Router();
accountProfileRouter.use(authenticate);
accountProfileRouter.use(express.json({ limit: "768kb" }));

const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = getAuthenticatedUser(res);
    await db
      .updateTable("users")
      .set({ avatarDataUrl: req.body.avatarDataUrl })
      .where("id", "=", userId)
      .executeTakeFirstOrThrow();

    const user = await db
      .selectFrom("users")
      .select(["id", "email", "name", "avatarDataUrl", "role"])
      .where("id", "=", userId)
      .executeTakeFirstOrThrow();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

accountProfileRouter.patch("/", accountProfileValidation, updateProfile);
