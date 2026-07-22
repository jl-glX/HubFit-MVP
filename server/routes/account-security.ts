import express from "express";
import {
  authenticate,
  getAuthenticatedUser,
} from "../middleware/authorization.js";
import { authenticationLimiter } from "../middleware/security.js";
import {
  accountMfaConfirmationValidation,
  mfaCodeValidation,
  passwordConfirmationValidation,
  sessionIdValidation,
} from "../middleware/validation.js";
import { clearSessionCookie } from "../lib/session-cookie.js";
import {
  getSecurityOverview,
  revokeOtherSessions,
  revokeSession,
} from "../services/account-security.js";
import {
  beginMfaSetup,
  disableMfa,
  enableMfa,
  regenerateRecoveryCodes,
  verifyMfaCode,
} from "../services/mfa.js";
import { verifyUserPassword } from "../services/auth.js";

export const accountSecurityRouter = express.Router();
accountSecurityRouter.use(authenticate);

accountSecurityRouter.get("/", async (_req, res, next) => {
  try {
    const auth = getAuthenticatedUser(res);
    res.json(await getSecurityOverview(auth.userId, auth.sessionId));
  } catch (error) {
    next(error);
  }
});

accountSecurityRouter.post(
  "/mfa/setup",
  authenticationLimiter,
  passwordConfirmationValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const auth = getAuthenticatedUser(res);
      if (!(await verifyUserPassword(auth.userId, req.body.password))) {
        res.status(401).json({ error: "Invalid security confirmation" });
        return;
      }
      res.json(await beginMfaSetup(auth.userId, auth.email));
    } catch (error) {
      next(error);
    }
  },
);

accountSecurityRouter.post(
  "/mfa/enable",
  authenticationLimiter,
  mfaCodeValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const auth = getAuthenticatedUser(res);
      res.json({
        recoveryCodes: await enableMfa(auth.userId, auth.email, req.body.code),
      });
    } catch (error) {
      next(error);
    }
  },
);

async function confirmSensitiveAction(
  req: express.Request,
  res: express.Response,
) {
  const auth = getAuthenticatedUser(res);
  return (
    (await verifyUserPassword(auth.userId, req.body.password)) &&
    (await verifyMfaCode(auth.userId, auth.email, req.body.code)).valid
  );
}

accountSecurityRouter.post(
  "/mfa/recovery-codes",
  authenticationLimiter,
  accountMfaConfirmationValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const auth = getAuthenticatedUser(res);
      if (!(await confirmSensitiveAction(req, res))) {
        res.status(401).json({ error: "Invalid security confirmation" });
        return;
      }
      res.json({ recoveryCodes: await regenerateRecoveryCodes(auth.userId) });
    } catch (error) {
      next(error);
    }
  },
);

accountSecurityRouter.delete(
  "/mfa",
  authenticationLimiter,
  accountMfaConfirmationValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const auth = getAuthenticatedUser(res);
      if (!(await confirmSensitiveAction(req, res))) {
        res.status(401).json({ error: "Invalid security confirmation" });
        return;
      }
      await disableMfa(auth.userId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

accountSecurityRouter.delete(
  "/sessions/:sessionId",
  sessionIdValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const auth = getAuthenticatedUser(res);
      if (!(await revokeSession(auth.userId, req.params.sessionId))) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      if (req.params.sessionId === auth.sessionId) clearSessionCookie(res);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

accountSecurityRouter.post(
  "/sessions/revoke-others",
  async (_req, res, next) => {
    try {
      const auth = getAuthenticatedUser(res);
      await revokeOtherSessions(auth.userId, auth.sessionId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);
