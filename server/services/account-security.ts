import { db } from "../db/client.js";
import { mfaStatus } from "./mfa.js";
import { recordSecurityEvent } from "./security-events.js";
import { passkeyStatus } from "./passkeys.js";

export async function getSecurityOverview(userId: string, sessionId: string) {
  const [mfa, passkeys, user, sessions, events] = await Promise.all([
    mfaStatus(userId),
    passkeyStatus(userId),
    db
      .selectFrom("users")
      .select("sessionIdleTimeoutMinutes")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("sessions")
      .select([
        "id",
        "createdAt",
        "lastSeenAt",
        "expiresAt",
        "userAgent",
        "remembered",
      ])
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
    passkeys,
    sessionIdleTimeoutMinutes: user.sessionIdleTimeoutMinutes,
    sessions: sessions
      .map((session) => ({
        ...session,
        current: session.id === sessionId,
        idleExpiresAt:
          session.lastSeenAt + user.sessionIdleTimeoutMinutes * 60 * 1000,
      }))
      .filter((session) => session.idleExpiresAt > Date.now()),
    events,
  };
}

export const SESSION_IDLE_TIMEOUT_OPTIONS = [
  15,
  60,
  8 * 60,
  24 * 60,
  7 * 24 * 60,
  30 * 24 * 60,
] as const;

export async function updateSessionIdleTimeout(
  userId: string,
  timeoutMinutes: number,
): Promise<void> {
  if (
    !SESSION_IDLE_TIMEOUT_OPTIONS.includes(
      timeoutMinutes as (typeof SESSION_IDLE_TIMEOUT_OPTIONS)[number],
    )
  ) {
    throw new Error("Invalid session inactivity timeout");
  }

  await db
    .updateTable("users")
    .set({ sessionIdleTimeoutMinutes: timeoutMinutes })
    .where("id", "=", userId)
    .execute();
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
