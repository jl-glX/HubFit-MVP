import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("billing API", () => {
  let directory: string;
  let database: typeof import("../db/client.js");
  let app: typeof import("../index.js").app;
  let adminCookie: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "hubfit-billing-"));
    vi.stubEnv("DATA_DIRECTORY", directory);
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
    database = await import("../db/client.js");
    const auth = await import("../services/auth.js");
    await database.initializeDatabase();
    await database.db
      .insertInto("users")
      .values({
        id: "billing-admin",
        email: "billing-admin@example.com",
        phone: null,
        name: "Billing Admin",
        password: await auth.hashPassword("BillingPassword123"),
        role: "admin",
        createdAt: Date.now(),
      })
      .execute();
    app = (await import("../index.js")).app;
    const login = await request(app).post("/api/auth/login").send({
      identifier: "billing-admin@example.com",
      password: "BillingPassword123",
      accessPortal: "staff",
      rememberDevice: false,
    });
    adminCookie = login.headers["set-cookie"][0];
  });

  afterAll(async () => {
    database.closeDatabase();
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it("stores a customised membership payment and updates its status", async () => {
    const created = await request(app)
      .post("/api/billing")
      .set("Cookie", adminCookie)
      .send({
        customerName: "Test Member",
        customerEmail: "member@example.com",
        concept: "Quarterly membership",
        billingCycle: "quarterly",
        amountCents: 12000,
        currency: "EUR",
        status: "pending",
        dueAt: Date.now() + 86_400_000,
        paidAt: null,
        invoiceNumber: "HF-TEST-001",
        notes: "Custom rate",
      })
      .expect(201);

    expect(created.body).toMatchObject({
      customerName: "Test Member",
      amountCents: 12000,
      status: "pending",
    });

    const updated = await request(app)
      .patch(`/api/billing/${created.body.id}`)
      .set("Cookie", adminCookie)
      .send({ status: "paid" })
      .expect(200);
    expect(updated.body.status).toBe("paid");
    expect(updated.body.paidAt).toEqual(expect.any(Number));
  });

  it("rejects unauthenticated billing access", async () => {
    await request(app).get("/api/billing").expect(401);
  });
});
