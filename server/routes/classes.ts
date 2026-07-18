import express from "express";
import { db } from "../db/client.js";
import { getClassWithAvailability } from "../services/booking.js";

export const classesRouter = express.Router();

// Get all classes
classesRouter.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const classes = await db
      .selectFrom("gymClasses")
      .selectAll()
      .orderBy("scheduledAt", "asc")
      .execute();

    const classesWithAvailability = await Promise.all(
      classes.map(async (gymClass) => {
        const withAvailability = await getClassWithAvailability(gymClass.id);
        return withAvailability;
      })
    );

    res.json(classesWithAvailability);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Get trainer's classes
classesRouter.get(
  "/trainer/:trainerId",
  async (req: express.Request, res: express.Response) => {
    try {
      const classes = await db
        .selectFrom("gymClasses")
        .selectAll()
        .where("trainerId", "=", req.params.trainerId)
        .orderBy("scheduledAt", "asc")
        .execute();

      const classesWithAvailability = await Promise.all(
        classes.map(async (gymClass) => {
          const withAvailability = await getClassWithAvailability(gymClass.id);
          return withAvailability;
        })
      );

      res.json(classesWithAvailability);
    } catch (error) {
      console.error("Error fetching trainer classes:", error);
      res.status(500).json({ error: "Failed to fetch trainer classes" });
    }
  }
);

// Get single class with availability
classesRouter.get(
  "/:id",
  async (req: express.Request, res: express.Response) => {
    try {
      const gymClass = await getClassWithAvailability(req.params.id);

      if (!gymClass) {
        res.status(404).json({ error: "Class not found" });
        return;
      }

      res.json(gymClass);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ error: "Failed to fetch class" });
    }
  }
);
