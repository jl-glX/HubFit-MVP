import express from "express";
import {
  completeMfaLogin,
  login,
  logout,
  logoutAll,
  signup,
} from "../services/auth.js";
import { authenticationLimiter } from "../middleware/security.js";
import {
  loginValidation,
  mfaCodeValidation,
  signupValidation,
} from "../middleware/validation.js";
import {
  authenticate,
  getAuthenticatedUser,
} from "../middleware/authorization.js";
import {
  clearSessionCookie,
  clearMfaChallengeCookie,
  readMfaChallengeToken,
  readSessionToken,
  setMfaChallengeCookie,
  setSessionCookie,
} from "../lib/session-cookie.js";

export const authRouter = express.Router();

authRouter.post(
  "/signup",
  authenticationLimiter,
  signupValidation,
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, name, password } = req.body;
      const { sessionToken, user } = await signup(email, name, password, {
        userAgent: req.get("User-Agent"),
      });
      setSessionCookie(res, sessionToken);
      res.status(201).json({ user });
    } catch (error) {
      console.error("[Auth] Signup failed");
      res.status(400).json({
        error: error instanceof Error ? error.message : "Signup failed",
      });
    }
  },
);

authRouter.post(
  "/login",
  authenticationLimiter,
  loginValidation,
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
      const result = await login(email, password, {
        userAgent: req.get("User-Agent"),
      });
      if ("challengeToken" in result) {
        setMfaChallengeCookie(res, result.challengeToken);
        res.status(200).json({ mfaRequired: true });
        return;
      }

      setSessionCookie(res, result.sessionToken);
      res.status(200).json({ user: result.user, mfaRequired: false });
    } catch {
      res.status(401).json({ error: "Invalid email or password" });
    }
  },
);

authRouter.post(
  "/mfa/verify",
  authenticationLimiter,
  mfaCodeValidation,
  async (req: express.Request, res: express.Response) => {
    const challengeToken = readMfaChallengeToken(req);
    if (!challengeToken) {
      res
        .status(401)
        .json({ error: "Invalid or expired verification challenge" });
      return;
    }

    try {
      const { sessionToken, user } = await completeMfaLogin(
        challengeToken,
        req.body.code,
        { userAgent: req.get("User-Agent") },
      );
      clearMfaChallengeCookie(res);
      setSessionCookie(res, sessionToken);
      res.status(200).json({ user });
    } catch {
      res.status(401).json({ error: "Invalid verification code" });
    }
  },
);

authRouter.get(
  "/session",
  authenticate,
  (_req: express.Request, res: express.Response) => {
    const session = getAuthenticatedUser(res);
    res.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  },
);

authRouter.post(
  "/logout",
  authenticate,
  async (req: express.Request, res: express.Response) => {
    const token = readSessionToken(req);
    if (token) {
      await logout(token);
    }
    clearSessionCookie(res);
    res.json({ message: "Logged out successfully" });
  },
);

authRouter.post(
  "/logout-all",
  authenticate,
  async (_req: express.Request, res: express.Response) => {
    await logoutAll(getAuthenticatedUser(res).userId);
    clearSessionCookie(res);
    res.json({ message: "All sessions revoked" });
  },
);
