import express from "express";
import {
  bookClass,
  cancelBooking,
  getUserBookings,
  getClassBookings,
  getClassWaitlist,
  exportClassAttendeesCsv,
} from "../services/booking.js";
import {
  bookingCancellationValidation,
  bookingValidation,
  validateId,
} from "../middleware/validation.js";
import {
  authenticate,
  requireSelfBodyOrRole,
  requireSelfParamOrRole,
  requireTrainerClassOrRole,
} from "../middleware/authorization.js";

export const bookingsRouter = express.Router();
bookingsRouter.use(authenticate);

// Get user bookings
bookingsRouter.get(
  "/user/:userId",
  validateId("userId"),
  requireSelfParamOrRole("userId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const bookings = await getUserBookings(req.params.userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  },
);

// Get class bookings (for admin/trainer view)
bookingsRouter.get(
  "/class/:classId",
  validateId("classId"),
  requireTrainerClassOrRole("classId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const bookings = await getClassBookings(req.params.classId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching class bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  },
);

// Export class attendees as CSV
bookingsRouter.get(
  "/class/:classId/export-csv",
  validateId("classId"),
  requireTrainerClassOrRole("classId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const csv = await exportClassAttendeesCsv(req.params.classId);
      res.setHeader("Content-Type", "text/csv;charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="attendees-${req.params.classId}.csv"`,
      );
      res.send(csv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  },
);

// Create booking
bookingsRouter.post(
  "/",
  bookingValidation,
  requireSelfBodyOrRole("userId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const { classId, userId } = req.body;

      if (!classId || !userId) {
        res.status(400).json({ error: "Missing classId or userId" });
        return;
      }

      const result = await bookClass(classId, userId);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating booking:", error);
      res.status(400).json({ error: message });
    }
  },
);

// Cancel booking
bookingsRouter.delete(
  "/:bookingId",
  bookingCancellationValidation,
  requireSelfBodyOrRole("userId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: "Missing userId" });
        return;
      }

      await cancelBooking(req.params.bookingId, userId);
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error cancelling booking:", error);
      res.status(400).json({ error: message });
    }
  },
);

// Get class waitlist
bookingsRouter.get(
  "/waitlist/:classId",
  validateId("classId"),
  requireTrainerClassOrRole("classId", "admin"),
  async (req: express.Request, res: express.Response) => {
    try {
      const waitlist = await getClassWaitlist(req.params.classId);
      res.json(waitlist);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).json({ error: "Failed to fetch waitlist" });
    }
  },
);
