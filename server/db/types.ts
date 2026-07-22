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
  lastSeenAt: number;
  expiresAt: number;
  revokedAt: number | null;
  userAgent: string;
}

interface MfaCredential {
  userId: string;
  secretEncrypted: string;
  recoveryCodeHashes: string;
  createdAt: number;
  updatedAt: number;
  enabledAt: number | null;
}

interface AuthChallenge {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  consumedAt: number | null;
}

interface SecurityEvent {
  id: string;
  userId: string | null;
  type: string;
  createdAt: number;
  metadata: string;
}

interface Feedback {
  id: string;
  userId: string | null;
  category: "suggestion" | "problem" | "accessibility" | "other";
  message: string;
  status: "new" | "reviewed" | "closed";
  createdAt: number;
}

export interface Database {
  users: User;
  gymClasses: GymClass;
  bookings: Booking;
  waitlistEntries: WaitlistEntry;
  sessions: Session;
  mfaCredentials: MfaCredential;
  authChallenges: AuthChallenge;
  securityEvents: SecurityEvent;
  feedback: Feedback;
}
