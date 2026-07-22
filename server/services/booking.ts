import { db } from "../db/client.js";

export async function getClassWithAvailability(classId: string) {
  const gymClass = await db
    .selectFrom("gymClasses")
    .selectAll()
    .where("id", "=", classId)
    .executeTakeFirst();

  if (!gymClass) {
    return null;
  }

  const confirmedCount = await db
    .selectFrom("bookings")
    .select((eb) => eb.fn.count("id").as("count"))
    .where("classId", "=", classId)
    .where("status", "=", "confirmed")
    .executeTakeFirst();

  const bookedCount = Number(confirmedCount?.count ?? 0);
  const availablePlaces = gymClass.maxCapacity - bookedCount;
  const waitlistCount = await db
    .selectFrom("waitlistEntries")
    .select((eb) => eb.fn.count("id").as("count"))
    .where("classId", "=", classId)
    .where("promotedAt", "is", null)
    .executeTakeFirst();

  return {
    ...gymClass,
    bookedCount,
    availablePlaces,
    waitlistCount: Number(waitlistCount?.count ?? 0),
  };
}

export async function bookClass(classId: string, userId: string) {
  const gymClass = await getClassWithAvailability(classId);

  if (!gymClass) {
    throw new Error("Class not found");
  }

  // Check if user already has a booking
  const existingBooking = await db
    .selectFrom("bookings")
    .select("id")
    .where("classId", "=", classId)
    .where("userId", "=", userId)
    .where("status", "!=", "cancelled")
    .executeTakeFirst();

  if (existingBooking) {
    throw new Error("User already has a booking for this class");
  }

  const bookingId = `booking-${classId}-${userId}-${Date.now()}`;

  if (gymClass.availablePlaces > 0) {
    // Book directly
    await db
      .insertInto("bookings")
      .values({
        id: bookingId,
        classId,
        userId,
        status: "confirmed",
        createdAt: Date.now(),
        cancelledAt: null,
      })
      .execute();

    return { bookingId, status: "confirmed" };
  } else {
    // Add to waitlist
    const position = Number(gymClass.waitlistCount ?? 0) + 1;
    const waitlistId = `waitlist-${classId}-${userId}-${Date.now()}`;

    await db
      .insertInto("waitlistEntries")
      .values({
        id: waitlistId,
        classId,
        userId,
        position,
        createdAt: Date.now(),
        promotedAt: null,
      })
      .execute();

    // Also create a waitlist booking record
    await db
      .insertInto("bookings")
      .values({
        id: bookingId,
        classId,
        userId,
        status: "waitlist",
        createdAt: Date.now(),
        cancelledAt: null,
      })
      .execute();

    return { bookingId, status: "waitlist", position };
  }
}

export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await db
    .selectFrom("bookings")
    .selectAll()
    .where("id", "=", bookingId)
    .where("userId", "=", userId)
    .executeTakeFirst();

  if (!booking) {
    throw new Error("Booking not found or not owned by user");
  }

  if (booking.status === "cancelled") {
    throw new Error("Booking already cancelled");
  }

  if (booking.status === "waitlist") {
    // Remove from waitlist
    await db
      .deleteFrom("waitlistEntries")
      .where("classId", "=", booking.classId)
      .where("userId", "=", userId)
      .execute();

    // Update position for remaining waitlist entries
    const remaining = await db
      .selectFrom("waitlistEntries")
      .select(["id", "position"])
      .where("classId", "=", booking.classId)
      .where("promotedAt", "is", null)
      .orderBy("position", "asc")
      .execute();

    for (let i = 0; i < remaining.length; i++) {
      await db
        .updateTable("waitlistEntries")
        .set({ position: i + 1 })
        .where("id", "=", remaining[i].id)
        .execute();
    }
  } else if (booking.status === "confirmed") {
    // Try to promote from waitlist
    await promoteFromWaitlist(booking.classId);
  }

  // Mark booking as cancelled
  await db
    .updateTable("bookings")
    .set({ status: "cancelled", cancelledAt: Date.now() })
    .where("id", "=", bookingId)
    .execute();
}

async function promoteFromWaitlist(classId: string) {
  const nextInWaitlist = await db
    .selectFrom("waitlistEntries")
    .selectAll()
    .where("classId", "=", classId)
    .where("promotedAt", "is", null)
    .orderBy("position", "asc")
    .limit(1)
    .executeTakeFirst();

  if (!nextInWaitlist) {
    return; // No one in waitlist
  }

  // Update waitlist entry as promoted
  await db
    .updateTable("waitlistEntries")
    .set({ promotedAt: Date.now() })
    .where("id", "=", nextInWaitlist.id)
    .execute();

  // Update booking status to confirmed
  await db
    .updateTable("bookings")
    .set({ status: "confirmed" })
    .where("classId", "=", classId)
    .where("userId", "=", nextInWaitlist.userId)
    .where("status", "=", "waitlist")
    .execute();

  // Update positions for remaining waitlist
  const remaining = await db
    .selectFrom("waitlistEntries")
    .select(["id", "position"])
    .where("classId", "=", classId)
    .where("promotedAt", "is", null)
    .orderBy("position", "asc")
    .execute();

  for (let i = 0; i < remaining.length; i++) {
    await db
      .updateTable("waitlistEntries")
      .set({ position: i + 1 })
      .where("id", "=", remaining[i].id)
      .execute();
  }
}

export async function getUserBookings(userId: string) {
  const bookings = await db
    .selectFrom("bookings")
    .innerJoin("gymClasses", "bookings.classId", "gymClasses.id")
    .select([
      "bookings.id",
      "bookings.classId",
      "bookings.status",
      "bookings.createdAt",
      "gymClasses.name",
      "gymClasses.scheduledAt",
      "gymClasses.trainerName",
    ])
    .where("bookings.userId", "=", userId)
    .where("bookings.status", "!=", "cancelled")
    .orderBy("gymClasses.scheduledAt", "desc")
    .execute();

  return bookings;
}

export async function getClassBookings(classId: string) {
  const bookings = await db
    .selectFrom("bookings")
    .innerJoin("users", "bookings.userId", "users.id")
    .select([
      "bookings.id",
      "bookings.userId",
      "bookings.status",
      "users.name",
      "users.email",
    ])
    .where("bookings.classId", "=", classId)
    .where("bookings.status", "=", "confirmed")
    .orderBy("bookings.createdAt", "asc")
    .execute();

  return bookings;
}

export async function getClassWaitlist(classId: string) {
  const waitlist = await db
    .selectFrom("waitlistEntries")
    .innerJoin("users", "waitlistEntries.userId", "users.id")
    .select([
      "waitlistEntries.id",
      "waitlistEntries.userId",
      "waitlistEntries.position",
      "waitlistEntries.createdAt",
      "users.name",
      "users.email",
    ])
    .where("waitlistEntries.classId", "=", classId)
    .where("waitlistEntries.promotedAt", "is", null)
    .orderBy("waitlistEntries.position", "asc")
    .execute();

  return waitlist;
}

export async function exportClassAttendeesCsv(
  classId: string,
): Promise<string> {
  const gymClass = await db
    .selectFrom("gymClasses")
    .selectAll()
    .where("id", "=", classId)
    .executeTakeFirst();

  if (!gymClass) {
    throw new Error("Class not found");
  }

  const attendees = await getClassBookings(classId);
  const waitlist = await getClassWaitlist(classId);

  const rows: string[] = [];

  // CSV Header
  rows.push('"Name","Email","Status","Waitlist Position"');

  // Confirmed attendees
  attendees.forEach((attendee) => {
    const name = escapeQuotes(attendee.name);
    const email = escapeQuotes(attendee.email);
    rows.push(`"${name}","${email}","Confirmed",""`);
  });

  // Waitlist entries
  waitlist.forEach((entry) => {
    const name = escapeQuotes(entry.name);
    const email = escapeQuotes(entry.email);
    rows.push(`"${name}","${email}","Waitlist","${entry.position}"`);
  });

  return rows.join("\n");
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '""');
}
