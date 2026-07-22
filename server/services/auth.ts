import { createHash, randomBytes } from "node:crypto";
import bcryptjs from "bcryptjs";
import { db } from "../db/client.js";

export const SESSION_DURATION = 24 * 60 * 60 * 1000;

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: "member" | "trainer" | "admin";
  createdAt: number;
  expiresAt: number;
}

export interface AuthResult {
  sessionToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "member" | "trainer" | "admin";
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function sessionId(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(user: AuthResult["user"]): Promise<AuthResult> {
  const now = Date.now();
  const token = randomBytes(32).toString("hex");

  await db.deleteFrom("sessions").where("expiresAt", "<", now).execute();
  await db
    .insertInto("sessions")
    .values({
      id: sessionId(token),
      userId: user.id,
      createdAt: now,
      expiresAt: now + SESSION_DURATION,
      revokedAt: null,
    })
    .execute();

  return { sessionToken: token, user };
}

export async function signup(
  email: string,
  name: string,
  password: string,
): Promise<AuthResult> {
  if (!isStrongPassword(password)) {
    throw new Error("Password does not meet the security requirements");
  }

  const existingUser = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirst();

  if (existingUser) {
    throw new Error("Unable to create account with these credentials");
  }

  const user = {
    id: `user-${randomBytes(8).toString("hex")}`,
    email,
    name,
    role: "member" as const,
  };

  await db
    .insertInto("users")
    .values({
      ...user,
      password: await hashPassword(password),
      createdAt: Date.now(),
    })
    .execute();

  return createSession(user);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    await bcryptjs.hash(password, 12);
    throw new Error("Invalid email or password");
  }

  if (!(await bcryptjs.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  return createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export async function verifyToken(token: string): Promise<SessionData | null> {
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return null;
  }

  const now = Date.now();
  const record = await db
    .selectFrom("sessions")
    .innerJoin("users", "users.id", "sessions.userId")
    .select([
      "sessions.userId",
      "sessions.createdAt",
      "sessions.expiresAt",
      "sessions.revokedAt",
      "users.email",
      "users.name",
      "users.role",
    ])
    .where("sessions.id", "=", sessionId(token))
    .executeTakeFirst();

  if (!record || record.revokedAt !== null || record.expiresAt <= now) {
    return null;
  }

  return {
    userId: record.userId,
    email: record.email,
    name: record.name,
    role: record.role,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
  };
}

export async function logout(token: string): Promise<void> {
  await db
    .updateTable("sessions")
    .set({ revokedAt: Date.now() })
    .where("id", "=", sessionId(token))
    .execute();
}

export async function logoutAll(userId: string): Promise<void> {
  await db
    .updateTable("sessions")
    .set({ revokedAt: Date.now() })
    .where("userId", "=", userId)
    .where("revokedAt", "is", null)
    .execute();
}
