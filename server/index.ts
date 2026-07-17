import express from "express";
import dotenv from "dotenv";
import { setupStaticServing } from "./static-serve.js";
import { initializeDatabase, closeDatabase } from "./db/client.js";
import { seedDatabase } from "./db/seed.js";
import { authRouter } from "./routes/auth.js";
import { classesRouter } from "./routes/classes.js";
import { bookingsRouter } from "./routes/bookings.js";
import { usersRouter } from "./routes/users.js";
import { adminClassesRouter } from "./routes/admin-classes.js";

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/classes", classesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin/classes", adminClassesRouter);

// Health check endpoint
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

// Export a function to start the server
export async function startServer(port: string | number) {
  try {
    // Initialize database
    await initializeDatabase();
    await seedDatabase();

    if (process.env.NODE_ENV === "production") {
      setupStaticServing(app);
    }

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
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Starting server...");
  startServer(process.env.PORT || 3001);
}
