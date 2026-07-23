import express from "express";
import { db } from "../db/client.js";
import {
  authenticate,
  getAuthenticatedUser,
  requireRole,
} from "../middleware/authorization.js";

export const memberCommerceRouter = express.Router();
memberCommerceRouter.use(authenticate, requireRole("member"));

memberCommerceRouter.get(
  "/summary",
  async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const member = getAuthenticatedUser(res);
      const payments = await db
        .selectFrom("billingRecords")
        .select([
          "id",
          "concept",
          "amountCents",
          "currency",
          "status",
          "dueAt",
          "paidAt",
          "invoiceNumber",
        ])
        .where((expression) =>
          expression.or([
            expression("userId", "=", member.userId),
            expression("customerEmail", "=", member.email),
          ]),
        )
        .where("archivedAt", "is", null)
        .orderBy("updatedAt", "desc")
        .execute();

      res.json({
        payments,
        orders: [],
        capabilities: {
          payments: true,
          orders: false,
          bankPayments: false,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
