import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { pathToFileURL } from "node:url";
import { setupStaticServing } from "./static-serve.js";
import { initializeDatabase, closeDatabase } from "./db/client.js";
import { seedDatabase } from "./db/seed.js";
import { authRouter } from "./routes/auth.js";
import { classesRouter } from "./routes/classes.js";
import { bookingsRouter } from "./routes/bookings.js";
import { usersRouter } from "./routes/users.js";
import { adminClassesRouter } from "./routes/admin-classes.js";
import { analyticsRouter } from "./routes/analytics.js";
import {
  apiLimiter,
  apiSecurityHeaders,
} from "./middleware/security.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";

dotenv.config();

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", false);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" && !process.env.CLIENT_ORIGIN
        ? false
        : clientOrigin.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 600,
  })
);
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);

app.use("/api", apiSecurityHeaders);
app.use("/api", apiLimiter);

// Body parsing middleware
const requestLimit = process.env.MAX_REQUEST_SIZE || "32kb";
app.use(express.json({ limit: requestLimit }));
app.use(express.urlencoded({ extended: true, limit: requestLimit }));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/classes", classesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin/classes", adminClassesRouter);
app.use("/api/analytics", analyticsRouter);

// Health check endpoint
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

app.use("/api", notFoundHandler);

if (process.env.NODE_ENV === "production") {
  setupStaticServing(app);
}

app.use(errorHandler);

// Export a function to start the server
export async function startServer(port: string | number) {
  try {
    // Initialize database
    await initializeDatabase();
    await seedDatabase();

    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down gracefully...");
      closeDatabase();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("Shutting down gracefully...");
      closeDatabase();
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log("Starting server...");
  startServer(process.env.PORT || 3001);
}
