interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "member" | "trainer" | "admin";
  createdAt: number;
}

interface GymClass {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  trainerName: string;
  maxCapacity: number;
  scheduledAt: number;
}

interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: "confirmed" | "cancelled" | "waitlist";
  createdAt: number;
  cancelledAt: number | null;
}

interface WaitlistEntry {
  id: string;
  classId: string;
  userId: string;
  position: number;
  createdAt: number;
  promotedAt: number | null;
}

interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  revokedAt: number | null;
}

export interface Database {
  users: User;
  gymClasses: GymClass;
  bookings: Booking;
  waitlistEntries: WaitlistEntry;
  sessions: Session;
}
