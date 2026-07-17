import { randomBytes } from "crypto";
import bcryptjs from "bcryptjs";
import { db } from "../db/client";

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const sessions = new Map<string, SessionData>();

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: "member" | "trainer" | "admin";
  createdAt: number;
  expiresAt: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "member" | "trainer" | "admin";
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function signup(
  email: string,
  name: string,
  password: string
): Promise<AuthResponse> {
  console.log(`[Auth] Signup attempt for: ${email}`);

  // Validate input
  if (!email || !name || !password) {
    throw new Error("Email, name, and password are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!email.includes("@")) {
    throw new Error("Invalid email format");
  }

  // Check if user exists
  const existingUser = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (existingUser) {
    console.log(`[Auth] User already exists: ${email}`);
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const userId = `user-${randomBytes(8).toString("hex")}`;

  await db
    .insertInto("users")
    .values({
      id: userId,
      email,
      name,
      password: hashedPassword,
      role: "member",
      createdAt: Date.now(),
    })
    .execute();

  console.log(`[Auth] User created successfully: ${email}`);

  const token = generateToken();
  sessions.set(token, {
    userId,
    email,
    name,
    role: "member",
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  });

  return {
    token,
    user: {
      id: userId,
      email,
      name,
      role: "member",
    },
  };
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  console.log(`[Auth] Login attempt for: ${email}`);

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    console.log(`[Auth] Login failed: user not found - ${email}`);
    throw new Error("Invalid email or password");
  }

  console.log(`[Auth] User found: ${email}, has password: ${!!user.password}, password length: ${user.password?.length || 0}`);

  const passwordMatch = await verifyPassword(password, user.password);
  if (!passwordMatch) {
    console.log(`[Auth] Login failed: wrong password - ${email}`);
    throw new Error("Invalid email or password");
  }

  console.log(`[Auth] Login successful: ${email}`);

  const token = generateToken();
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export function verifyToken(token: string): SessionData | null {
  const session = sessions.get(token);
  if (!session) {
    console.log("[Auth] Token not found");
    return null;
  }

  if (session.expiresAt < Date.now()) {
    console.log("[Auth] Token expired");
    sessions.delete(token);
    return null;
  }

  return session;
}

export function logout(token: string): void {
  sessions.delete(token);
  console.log("[Auth] User logged out");
}

export function getAllSessions(): Map<string, SessionData> {
  return new Map(sessions);
}
