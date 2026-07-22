import { db } from "../db/client.js";
import { mfaStatus } from "./mfa.js";
import { recordSecurityEvent } from "./security-events.js";

export async function getSecurityOverview(userId: string, sessionId: string) {
  const [mfa, sessions, events] = await Promise.all([
    mfaStatus(userId),
    db
      .selectFrom("sessions")
      .select(["id", "createdAt", "lastSeenAt", "expiresAt", "userAgent"])
      .where("userId", "=", userId)
      .where("revokedAt", "is", null)
      .where("expiresAt", ">", Date.now())
      .orderBy("lastSeenAt", "desc")
      .execute(),
    db
      .selectFrom("securityEvents")
      .select(["id", "type", "createdAt"])
      .where("userId", "=", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .execute(),
  ]);

  return {
    mfa,
    sessions: sessions.map((session) => ({
      ...session,
      current: session.id === sessionId,
    })),
    events,
  };
}

export async function revokeSession(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const result = await db
    .updateTable("sessions")
    .set({ revokedAt: Date.now() })
    .where("id", "=", sessionId)
    .where("userId", "=", userId)
    .where("revokedAt", "is", null)
    .executeTakeFirst();
  if (Number(result.numUpdatedRows) > 0) {
    await recordSecurityEvent("session_revoked", userId);
    return true;
  }
  return false;
}

export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string,
): Promise<void> {
  await db
    .updateTable("sessions")
    .set({ revokedAt: Date.now() })
    .where("userId", "=", userId)
    .where("id", "!=", currentSessionId)
    .where("revokedAt", "is", null)
    .execute();
  await recordSecurityEvent("all_other_sessions_revoked", userId);
}
