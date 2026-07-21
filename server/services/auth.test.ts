import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("persistent authentication sessions", () => {
  let directory: string;
  let database: typeof import("../db/client.js");
  let auth: typeof import("./auth.js");

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "hubfit-auth-"));
    vi.stubEnv("DATA_DIRECTORY", directory);
    vi.resetModules();
    database = await import("../db/client.js");
    auth = await import("./auth.js");
    await database.initializeDatabase();
  });

  afterAll(async () => {
    database.closeDatabase();
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it("stores only a token hash, reads the current role and revokes the session", async () => {
    const result = await auth.signup(
      "secure-member@example.com",
      "Secure Member",
      "StrongPassword123"
    );

    const stored = await database.db
      .selectFrom("sessions")
      .selectAll()
      .executeTakeFirstOrThrow();

    expect(stored.id).not.toBe(result.sessionToken);
    expect(stored.id).toMatch(/^[a-f0-9]{64}$/);
    expect(await auth.verifyToken(result.sessionToken)).toMatchObject({
      userId: result.user.id,
      role: "member",
    });

    await database.db
      .updateTable("users")
      .set({ role: "trainer" })
      .where("id", "=", result.user.id)
      .execute();
    expect(await auth.verifyToken(result.sessionToken)).toMatchObject({ role: "trainer" });

    await auth.logout(result.sessionToken);
    expect(await auth.verifyToken(result.sessionToken)).toBeNull();
  });
});
