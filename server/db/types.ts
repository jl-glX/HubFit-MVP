export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "member" | "trainer" | "admin";
  createdAt: number;
}

export interface GymClass {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  trainerName: string;
  maxCapacity: number;
  scheduledAt: number;
}

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: "confirmed" | "cancelled" | "waitlist";
  createdAt: number;
  cancelledAt: number | null;
}

export interface WaitlistEntry {
  id: string;
  classId: string;
  userId: string;
  position: number;
  createdAt: number;
  promotedAt: number | null;
}

export interface Database {
  users: User;
  gymClasses: GymClass;
  bookings: Booking;
  waitlistEntries: WaitlistEntry;
}
