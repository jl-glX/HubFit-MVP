import express from "express";
import {
  getMonthlyMetrics,
  getClassPopularity,
  getPeakHours,
  getUserActivityMetrics,
  getTrainerActivityMetrics,
  getMemberMetrics,
  getUpcomingBookings,
  getTrainerUpcomingClasses,
} from "../services/analytics.js";
import { monthValidation, validateId } from "../middleware/validation.js";
import {
  authenticate,
  requireRole,
  requireSelfParamOrRole,
} from "../middleware/authorization.js";

export const analyticsRouter = express.Router();
analyticsRouter.use(authenticate);

// Get monthly metrics
analyticsRouter.get(
  "/monthly",
  monthValidation,
  requireRole("admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      if (!year || !month) {
        res.status(400).json({ error: "Missing year or month" });
        return;
      }

      const metrics = await getMonthlyMetrics(year, month);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching monthly metrics:", error);
      res.status(500).json({ error: "Failed to fetch monthly metrics" });
    }
  },
);

// Get class popularity
analyticsRouter.get(
  "/class-popularity",
  async (req: express.Request, res: express.Response) => {
    try {
      const popularity = await getClassPopularity();
      res.json(popularity);
    } catch (error) {
      console.error("Error fetching class popularity:", error);
      res.status(500).json({ error: "Failed to fetch class popularity" });
    }
  },
);

// Get peak hours
analyticsRouter.get(
  "/peak-hours",
  async (req: express.Request, res: express.Response) => {
    try {
      const peakHours = await getPeakHours();
      res.json(peakHours);
    } catch (error) {
      console.error("Error fetching peak hours:", error);
      res.status(500).json({ error: "Failed to fetch peak hours" });
    }
  },
);

// Get user activity metrics
analyticsRouter.get(
  "/user/:userId",
  validateId("userId"),
  requireSelfParamOrRole("userId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const metrics = await getUserActivityMetrics(req.params.userId);

      if (!metrics) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(metrics);
    } catch (error) {
      console.error("Error fetching user activity metrics:", error);
      res.status(500).json({ error: "Failed to fetch user activity metrics" });
    }
  },
);

// Get trainer activity metrics
analyticsRouter.get(
  "/trainer/:trainerId",
  validateId("trainerId"),
  requireRole("trainer", "admin"),
  requireSelfParamOrRole("trainerId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const metrics = await getTrainerActivityMetrics(req.params.trainerId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching trainer activity metrics:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch trainer activity metrics" });
    }
  },
);

// Get member metrics
analyticsRouter.get(
  "/members",
  requireRole("admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const metrics = await getMemberMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching member metrics:", error);
      res.status(500).json({ error: "Failed to fetch member metrics" });
    }
  },
);

// Get upcoming bookings for a user
analyticsRouter.get(
  "/user/:userId/upcoming-bookings",
  validateId("userId"),
  requireSelfParamOrRole("userId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const bookings = await getUpcomingBookings(req.params.userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error);
      res.status(500).json({ error: "Failed to fetch upcoming bookings" });
    }
  },
);

// Get trainer upcoming classes
analyticsRouter.get(
  "/trainer/:trainerId/upcoming-classes",
  validateId("trainerId"),
  requireRole("trainer", "admin"),
  requireSelfParamOrRole("trainerId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const classes = await getTrainerUpcomingClasses(req.params.trainerId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching trainer upcoming classes:", error);
      res.status(500).json({ error: "Failed to fetch upcoming classes" });
    }
  },
);
