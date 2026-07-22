import express from "express";
import { login, logout, logoutAll, signup } from "../services/auth.js";
import { authenticationLimiter } from "../middleware/security.js";
import { loginValidation, signupValidation } from "../middleware/validation.js";
import {
  authenticate,
  getAuthenticatedUser,
} from "../middleware/authorization.js";
import {
  clearSessionCookie,
  readSessionToken,
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
      const { sessionToken, user } = await signup(email, name, password);
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
      const { sessionToken, user } = await login(email, password);
      setSessionCookie(res, sessionToken);
      res.status(200).json({ user });
    } catch {
      res.status(401).json({ error: "Invalid email or password" });
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
