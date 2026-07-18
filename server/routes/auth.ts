import express from "express";
import { signup, login, logout, verifyToken } from "../services/auth.js";
import { db } from "../db/client.js";

export const authRouter = express.Router();

authRouter.post("/signup", async (req: express.Request, res: express.Response) => {
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

authRouter.post("/login", async (req: express.Request, res: express.Response) => {
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

authRouter.post("/logout", (req: express.Request, res: express.Response) => {
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

authRouter.post("/verify", (req: express.Request, res: express.Response) => {
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

// Debug endpoint to check user data (remove in production)
authRouter.get("/debug/users", async (req: express.Request, res: express.Response) => {
  try {
    const users = await db
      .selectFrom("users")
      .select(["id", "email", "name", "role", "password"])
      .execute();
    
    res.json({
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        hasPassword: !!u.password,
        passwordLength: u.password?.length || 0,
        passwordPreview: u.password ? `${u.password.substring(0, 10)}...` : "empty"
      }))
    });
  } catch (error) {
    console.error("[Auth Route] Debug users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
