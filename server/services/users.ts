import { db } from "../db/client";
import { hashPassword } from "./auth";
import { randomBytes } from "crypto";

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  role: "member" | "trainer" | "admin";
  createdAt: number;
}

export async function getAllUsers(): Promise<UserWithoutPassword[]> {
  const users = await db
    .selectFrom("users")
    .select(["id", "email", "name", "role", "createdAt"])
    .orderBy("createdAt", "desc")
    .execute();

  return users;
}

export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const user = await db
    .selectFrom("users")
    .select(["id", "email", "name", "role", "createdAt"])
    .where("id", "=", id)
    .executeTakeFirst();

  return user || null;
}

export async function createUser(
  email: string,
  name: string,
  password: string,
  role: "member" | "trainer" | "admin" = "member"
): Promise<UserWithoutPassword> {
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
      role,
      createdAt: Date.now(),
    })
    .execute();

  return {
    id: userId,
    email,
    name,
    role,
    createdAt: Date.now(),
  };
}

export async function updateUser(
  id: string,
  updates: {
    email?: string;
    name?: string;
    password?: string;
    role?: "member" | "trainer" | "admin";
  }
): Promise<UserWithoutPassword> {
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!user) {
    throw new Error("User not found");
  }

  // Validate email uniqueness if changing email
  if (updates.email && updates.email !== user.email) {
    const existingUser = await db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", updates.email)
      .executeTakeFirst();

    if (existingUser) {
      throw new Error("Email already in use");
    }
  }

  const updateValues: Record<string, unknown> = {};

  if (updates.email) updateValues.email = updates.email;
  if (updates.name) updateValues.name = updates.name;
  if (updates.role) updateValues.role = updates.role;

  if (updates.password) {
    if (updates.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    updateValues.password = await hashPassword(updates.password);
  }

  await db
    .updateTable("users")
    .set(updateValues)
    .where("id", "=", id)
    .execute();

  const updatedUser = await db
    .selectFrom("users")
    .select(["id", "email", "name", "role", "createdAt"])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!updatedUser) {
    throw new Error("Failed to retrieve updated user");
  }

  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!user) {
    throw new Error("User not found");
  }

  // Delete user's bookings
  await db
    .deleteFrom("bookings")
    .where("userId", "=", id)
    .execute();

  // Delete user's waitlist entries
  await db
    .deleteFrom("waitlistEntries")
    .where("userId", "=", id)
    .execute();

  // Delete user
  await db
    .deleteFrom("users")
    .where("id", "=", id)
    .execute();
}

export async function deleteMultipleUsers(userIds: string[]): Promise<void> {
  for (const id of userIds) {
    try {
      await deleteUser(id);
    } catch (err) {
      console.error(`Error deleting user ${id}:`, err);
    }
  }
}

export async function updateUserRole(
  id: string,
  role: "member" | "trainer" | "admin"
): Promise<UserWithoutPassword> {
  return updateUser(id, { role });
}
