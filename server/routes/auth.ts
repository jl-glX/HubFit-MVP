import express from "express";
import { signup, login, logout, verifyToken } from "../services/auth.js";
import { authenticationLimiter } from "../middleware/security.js";
import {
  loginValidation,
  signupValidation,
  tokenValidation,
} from "../middleware/validation.js";

export const authRouter = express.Router();

authRouter.post("/signup", authenticationLimiter, signupValidation, async (req: express.Request, res: express.Response) => {
  try {
    const { email, name, password } = req.body;

    const result = await signup(email, name, password);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    console.error("[Auth Route] Signup error:", error);
    res.status(400).json({ error: message });
  }
});
authRouter.post("/login", authenticationLimiter, loginValidation, async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    console.error("[Auth Route] Login error:", error);
    res.status(400).json({ error: message });
  }
});

authRouter.post("/logout", tokenValidation, (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token required" });
      return;
    }

    logout(token);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("[Auth Route] Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

authRouter.post("/verify", tokenValidation, (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token required" });
      return;
    }

    const session = verifyToken(token);
    if (!session) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    res.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error) {
    console.error("[Auth Route] Verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});
