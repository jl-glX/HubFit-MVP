import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as DatabaseSchema } from "./types.js";

const dataDirectory = process.env.DATA_DIRECTORY ?? "/home/app/data";

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, "database.sqlite");
const sqliteDb = new Database(databasePath);

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({ database: sqliteDb }),
  log: ["query", "error"],
});

export async function initializeDatabase() {
  console.log("Initializing database...");

  const tables = sqliteDb
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all() as Array<{ name: string }>;

  const tableNames = tables.map((t) => t.name);

  if (!tableNames.includes("users")) {
    console.log("Creating users table...");
    sqliteDb.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'member',
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role ON users(role);
    `);
  } else {
    // Check if password and role columns exist, add them if they don't
    const userColumns = sqliteDb
      .prepare("PRAGMA table_info(users)")
      .all() as Array<{ name: string }>;
    
    const columnNames = userColumns.map((c) => c.name);
    
    if (!columnNames.includes("password")) {
      console.log("Adding password column to users table...");
      sqliteDb.exec("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''");
    }
    
    if (!columnNames.includes("role")) {
      console.log("Adding role column to users table...");
      sqliteDb.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member'");
      
      // Create index if it doesn't exist
      const indexes = sqliteDb
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='users'")
        .all() as Array<{ name: string }>;
      
      if (!indexes.some(idx => idx.name === "idx_users_role")) {
        sqliteDb.exec("CREATE INDEX idx_users_role ON users(role)");
      }
    }
  }

  if (!tableNames.includes("gymClasses")) {
    console.log("Creating gymClasses table...");
    sqliteDb.exec(`
      CREATE TABLE gymClasses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        trainerId TEXT NOT NULL,
        trainerName TEXT NOT NULL,
        maxCapacity INTEGER NOT NULL,
        scheduledAt INTEGER NOT NULL
      );
      CREATE INDEX idx_gymClasses_scheduledAt ON gymClasses(scheduledAt);
    `);
  }

  if (!tableNames.includes("bookings")) {
    console.log("Creating bookings table...");
    sqliteDb.exec(`
      CREATE TABLE bookings (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        userId TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('confirmed', 'cancelled', 'waitlist')),
        createdAt INTEGER NOT NULL,
        cancelledAt INTEGER,
        FOREIGN KEY(classId) REFERENCES gymClasses(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      );
      CREATE INDEX idx_bookings_classId ON bookings(classId);
      CREATE INDEX idx_bookings_userId ON bookings(userId);
      CREATE INDEX idx_bookings_status ON bookings(status);
    `);
  }

  if (!tableNames.includes("waitlistEntries")) {
    console.log("Creating waitlistEntries table...");
    sqliteDb.exec(`
      CREATE TABLE waitlistEntries (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        userId TEXT NOT NULL,
        position INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        promotedAt INTEGER,
        FOREIGN KEY(classId) REFERENCES gymClasses(id),
        FOREIGN KEY(userId) REFERENCES users(id),
        UNIQUE(classId, userId)
      );
      CREATE INDEX idx_waitlistEntries_classId ON waitlistEntries(classId);
      CREATE INDEX idx_waitlistEntries_userId ON waitlistEntries(userId);
    `);
  }

  console.log("Database initialized successfully");
}

export function closeDatabase() {
  sqliteDb.close();
}
