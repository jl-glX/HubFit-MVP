import { performance } from "node:perf_hooks";
import { sql } from "kysely";
import { db } from "../db/client.js";

type TaskPriority = "critical" | "normal" | "low";
type TaskState = "idle" | "running" | "paused" | "error";

interface ManagedTaskDefinition {
  id: string;
  name: string;
  description: string;
  intervalMs: number;
  priority: TaskPriority;
  enabledByDefault: boolean;
  run: () => Promise<number | void>;
}

interface ManagedTaskRuntime {
  definition: ManagedTaskDefinition;
  enabled: boolean;
  state: TaskState;
  timer: NodeJS.Timeout | null;
  lastRunAt: number | null;
  nextRunAt: number | null;
  lastDurationMs: number | null;
  lastResultCount: number | null;
  runCount: number;
  errorCount: number;
  lastError: string | null;
}

export interface ManagedTaskStatus {
  id: string;
  name: string;
  description: string;
  intervalMs: number;
  priority: TaskPriority;
  enabled: boolean;
  state: TaskState;
  lastRunAt: number | null;
  nextRunAt: number | null;
  lastDurationMs: number | null;
  lastResultCount: number | null;
  runCount: number;
  errorCount: number;
  lastError: string | null;
}

const tasks = new Map<string, ManagedTaskRuntime>();
let started = false;

function serializeTask(task: ManagedTaskRuntime): ManagedTaskStatus {
  return {
    id: task.definition.id,
    name: task.definition.name,
    description: task.definition.description,
    intervalMs: task.definition.intervalMs,
    priority: task.definition.priority,
    enabled: task.enabled,
    state: task.state,
    lastRunAt: task.lastRunAt,
    nextRunAt: task.nextRunAt,
    lastDurationMs: task.lastDurationMs,
    lastResultCount: task.lastResultCount,
    runCount: task.runCount,
    errorCount: task.errorCount,
    lastError: task.lastError,
  };
}

function schedule(task: ManagedTaskRuntime): void {
  if (!started || !task.enabled || task.state === "running") return;

  if (task.timer) clearTimeout(task.timer);
  task.nextRunAt = Date.now() + task.definition.intervalMs;
  task.timer = setTimeout(() => {
    task.timer = null;
    void runManagedTask(task.definition.id);
  }, task.definition.intervalMs);
  task.timer.unref();
}

function registerTask(definition: ManagedTaskDefinition): void {
  tasks.set(definition.id, {
    definition,
    enabled: definition.enabledByDefault,
    state: definition.enabledByDefault ? "idle" : "paused",
    timer: null,
    lastRunAt: null,
    nextRunAt: null,
    lastDurationMs: null,
    lastResultCount: null,
    runCount: 0,
    errorCount: 0,
    lastError: null,
  });
}

async function cleanupExpiredAuthenticationData(): Promise<number> {
  const now = Date.now();
  const revokedSessionRetention = now - 7 * 24 * 60 * 60 * 1000;

  const results = await Promise.all([
    db
      .deleteFrom("sessions")
      .where((expression) =>
        expression.or([
          expression("expiresAt", "<", now),
          expression("revokedAt", "<", revokedSessionRetention),
        ]),
      )
      .executeTakeFirst(),
    db
      .deleteFrom("authChallenges")
      .where("expiresAt", "<", now)
      .executeTakeFirst(),
    db
      .deleteFrom("webauthnChallenges")
      .where("expiresAt", "<", now)
      .executeTakeFirst(),
  ]);

  return results.reduce(
    (total, result) => total + Number(result.numDeletedRows),
    0,
  );
}

async function optimizeSqlitePlanner(): Promise<void> {
  await sql`PRAGMA optimize`.execute(db);
}

registerTask({
  id: "expired-auth-cleanup",
  name: "Expired authentication cleanup",
  description:
    "Removes expired login sessions and completed authentication challenges.",
  intervalMs: 30 * 60 * 1000,
  priority: "normal",
  enabledByDefault: true,
  run: cleanupExpiredAuthenticationData,
});

registerTask({
  id: "sqlite-query-planner",
  name: "SQLite query planner optimization",
  description:
    "Lets SQLite refresh lightweight planner statistics when the database needs it.",
  intervalMs: 6 * 60 * 60 * 1000,
  priority: "low",
  enabledByDefault: true,
  run: optimizeSqlitePlanner,
});

export function startResourceManager(): void {
  if (started) return;
  started = true;
  for (const task of tasks.values()) schedule(task);
}

export function stopResourceManager(): void {
  started = false;
  for (const task of tasks.values()) {
    if (task.timer) clearTimeout(task.timer);
    task.timer = null;
    task.nextRunAt = null;
    if (task.state !== "running") {
      task.state = task.enabled ? "idle" : "paused";
    }
  }
}

export async function runManagedTask(
  taskId: string,
): Promise<ManagedTaskStatus> {
  const task = tasks.get(taskId);
  if (!task) throw new Error("Managed task not found");
  if (task.state === "running")
    throw new Error("Managed task is already running");

  if (task.timer) clearTimeout(task.timer);
  task.timer = null;
  task.nextRunAt = null;
  task.state = "running";
  const startedAt = performance.now();

  try {
    const result = await task.definition.run();
    task.lastResultCount = typeof result === "number" ? result : null;
    task.lastError = null;
    task.state = task.enabled ? "idle" : "paused";
    task.runCount += 1;
  } catch (error) {
    task.errorCount += 1;
    task.lastError =
      error instanceof Error ? error.message : "Unknown task error";
    task.state = "error";
    throw error;
  } finally {
    task.lastRunAt = Date.now();
    task.lastDurationMs = Math.round(performance.now() - startedAt);
    schedule(task);
  }

  return serializeTask(task);
}

export function setManagedTaskEnabled(
  taskId: string,
  enabled: boolean,
): ManagedTaskStatus {
  const task = tasks.get(taskId);
  if (!task) throw new Error("Managed task not found");

  task.enabled = enabled;
  if (!enabled) {
    if (task.timer) clearTimeout(task.timer);
    task.timer = null;
    task.nextRunAt = null;
    if (task.state !== "running") task.state = "paused";
  } else {
    if (task.state !== "running") task.state = "idle";
    schedule(task);
  }

  return serializeTask(task);
}

export function getResourceManagerStatus() {
  const memory = process.memoryUsage();
  return {
    started,
    process: {
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssBytes: memory.rss,
        heapUsedBytes: memory.heapUsed,
        heapTotalBytes: memory.heapTotal,
        externalBytes: memory.external,
      },
      nodeVersion: process.version,
      pid: process.pid,
    },
    tasks: [...tasks.values()].map(serializeTask),
  };
}
