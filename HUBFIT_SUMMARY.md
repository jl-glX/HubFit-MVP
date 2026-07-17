# HubFit v1 - Gym Class Reservation System

## Project Overview
HubFit is a responsive web application for managing and reserving gym classes. Users can browse available classes, make bookings, manage waitlists, and receive automatic promotion when spots open up.

---

## Architecture

### Frontend (React 18 + TypeScript + Vite)
```
client/src/
├── pages/              # Page components for routing
│   ├── HomePage.tsx     # Landing page with feature overview
│   ├── ClassesPage.tsx  # Class browsing and booking interface
│   └── MyBookingsPage.tsx # User's booking management
├── components/          # Reusable UI components
│   ├── Navigation.tsx    # Main navigation bar
│   ├── ClassCard.tsx     # Individual class display card
│   └── UserBookings.tsx  # User's active bookings list
├── hooks/              # Custom React hooks
│   ├── useClasses.ts    # Fetch and manage classes
│   ├── useBookings.ts   # Booking operations and state
│   └── useCurrentUser.ts # Current user context
├── lib/                # Utility functions
│   └── dateUtils.ts    # Date formatting and grouping
├── components/ui/      # shadcn/ui components (15 components available)
└── App.tsx            # Router setup and main app component
```

### Backend (Node.js + Express 5 + TypeScript)
```
server/
├── db/
│   ├── types.ts       # TypeScript interfaces for all entities
│   ├── client.ts      # Kysely database client and initialization
│   └── seed.ts        # Demo data seeding
├── services/
│   └── booking.ts     # Business logic for class and booking operations
├── routes/
│   ├── classes.ts     # GET endpoints for classes
│   └── bookings.ts    # CRUD endpoints for bookings
└── index.ts          # Express app setup and server startup
```

### Database (SQLite)
```
Database Tables:
├── users               # Demo users with email and name
├── gymClasses         # Classes with trainer info, capacity, schedule
├── bookings           # User bookings (confirmed/waitlist/cancelled)
└── waitlistEntries    # Waitlist management with positioning
```

---

## Key Features Implemented

### ✅ Class Calendar
- Classes displayed organized by date and time
- Shows trainer name, capacity, and availability
- 7-day schedule with realistic demo data
- Responsive grid layout for mobile and desktop

### ✅ Booking System
- Instant booking when spots available
- Smart waitlist when class is full
- Shows available spaces and waitlist count
- Users can only book once per class

### ✅ Waitlist Management
- Automatic position tracking
- Promotes to confirmed when spots open
- Position updates when users cancel
- FIFO (First-In-First-Out) promotion logic

### ✅ User Bookings
- View all active bookings
- Cancel future bookings
- Visual indication of waitlist status
- Organized by most recent first

### ✅ Data Validation
- TypeScript strict mode throughout
- Proper error handling and user feedback
- Input validation on all API endpoints
- Database constraints for data integrity

---

## Technology Stack

### Dependencies
- **React 18.2.0** - UI framework
- **React Router DOM 6.24.0** - Client-side routing
- **TypeScript 5.8.2** - Type safety
- **Vite 6.3.1** - Frontend build tool
- **Express 5.1.0** - HTTP server
- **Kysely 0.26.3** - SQL query builder
- **Better SQLite3 12.3.0** - SQLite driver
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - Component library
- **Lucide React 0.474.0** - Icons

### Dev Dependencies
- **tsx 4.19.3** - TypeScript runner
- **Autoprefixer 10.4.18** - CSS vendor prefixes
- **PostCSS 8.4.35** - CSS processing

---

## API Endpoints

### Classes
```
GET /api/classes           # Get all classes with availability info
GET /api/classes/:id       # Get single class details
```

### Bookings
```
GET /api/bookings/user/:userId        # Get user's bookings
GET /api/bookings/class/:classId      # Get class attendees
POST /api/bookings                     # Create new booking
DELETE /api/bookings/:bookingId        # Cancel booking
```

### Health Check
```
GET /api/health            # Server health status
```

---

## Database Schema

### Users Table
- `id` (TEXT, PK)
- `email` (TEXT, UNIQUE)
- `name` (TEXT)
- `createdAt` (INTEGER)

### GymClasses Table
- `id` (TEXT, PK)
- `name` (TEXT)
- `description` (TEXT)
- `trainerId` (TEXT)
- `trainerName` (TEXT)
- `maxCapacity` (INTEGER)
- `scheduledAt` (INTEGER, indexed)

### Bookings Table
- `id` (TEXT, PK)
- `classId` (TEXT, FK)
- `userId` (TEXT, FK)
- `status` (TEXT: confirmed/waitlist/cancelled)
- `createdAt` (INTEGER)
- `cancelledAt` (INTEGER, nullable)

### WaitlistEntries Table
- `id` (TEXT, PK)
- `classId` (TEXT, FK)
- `userId` (TEXT, FK, UNIQUE per class)
- `position` (INTEGER)
- `createdAt` (INTEGER)
- `promotedAt` (INTEGER, nullable)

---

## Demo Data

### Included Users
- Juan Pérez (juan@example.com)
- María González (maria@example.com)
- Carlos López (carlos@example.com)
- Laura Fernández (laura@example.com)
- Ana Martínez (ana@example.com)

### Class Schedule
- 7 days of upcoming classes
- 5 time slots per day (9am, 11am, 4pm, 6pm, 8pm)
- 6 class types: Yoga Flow, HIIT Bootcamp, Pilates Core, Spinning, Box Fit, Zumba
- 4 trainers rotating across classes
- Capacity: 15-20 users per class

### Sample Bookings
- First 3 days have pre-filled bookings (8 users per class)
- Demonstrates available and full classes
- Ready to test booking and waitlist features

---

## Running the Application

### Development
```bash
npm start
```
Starts both Vite dev server (port 3000) and Express API (port 3001)

### Production Build
```bash
npm run build
```
Builds frontend and TypeScript backend. Express serves both API and static files on port 4000.

---

## Features & Validations

### Business Logic
✅ Automatic waitlist promotion when cancellations occur
✅ Prevents duplicate bookings for same user/class
✅ Automatic position reordering on cancellations
✅ Status transitions: confirmed → cancelled or waitlist → confirmed
✅ Timezone-aware date formatting (Spanish locale)

### UI/UX
✅ Loading states and error messages
✅ Responsive design (mobile-first)
✅ Visual feedback for booking actions
✅ Intuitive navigation between pages
✅ Real-time availability updates

### Code Quality
✅ TypeScript strict mode with no `any` types
✅ Modular component structure (single responsibility)
✅ Custom hooks for state management
✅ Proper error handling throughout
✅ No hardcoded values (uses constants)
✅ Clean separation of concerns

---

## Current Limitations

1. **Authentication**: Uses demo user (no login system yet)
2. **Admin Features**: No trainer/admin dashboard
3. **Notifications**: No email or push notifications for promotions
4. **User Profiles**: No profile editing or preferences
5. **Search/Filter**: Classes only sortable by date
6. **Real-time Updates**: No WebSocket support (manual refresh needed)
7. **Payment**: No payment processing
8. **Analytics**: No tracking or reporting features

---

## Next Steps for Production

1. **Authentication System**
   - User signup/login with JWT tokens
   - Session persistence
   - Password recovery

2. **Trainer Dashboard**
   - Class management interface
   - Attendee and waitlist views
   - Class cancellation/rescheduling

3. **Notifications**
   - Email notifications for promotions
   - SMS alerts for class reminders
   - In-app notification center

4. **Enhanced Features**
   - Search and filter classes
   - User favorites/preferences
   - Class ratings and reviews
   - Multi-location support

5. **Admin Panel**
   - User management
   - Class scheduling
   - Revenue analytics
   - Bulk operations

---

## File Structure Summary

```
/home/app/
├── client/                          # Frontend application
│   ├── public/                      # Static assets
│   │   ├── site.webmanifest        # PWA manifest (updated)
│   │   └── favicon.ico
│   └── src/
│       ├── pages/                   # 3 page components
│       ├── components/              # 3 custom components + UI library
│       ├── hooks/                   # 3 custom hooks
│       ├── lib/                     # Utility functions
│       └── App.tsx                  # Router setup
│
├── server/                          # Backend application
│   ├── db/                          # Database layer
│   │   ├── types.ts                # TypeScript types
│   │   ├── client.ts               # Kysely setup
│   │   └── seed.ts                 # Demo data
│   ├── services/                    # Business logic
│   │   └── booking.ts              # Core operations
│   ├── routes/                      # API endpoints
│   │   ├── classes.ts
│   │   └── bookings.ts
│   └── index.ts                     # Express setup
│
├── data/                            # Persistent storage
│   └── database.sqlite              # SQLite database
│
├── scripts/
│   └── dev.ts                       # Dev server orchestration
│
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.js                  # Vite config
├── tailwind.config.js              # Tailwind config
└── components.json                 # shadcn/ui config
```

---

## Quality Assurance

All validations completed:
- ✅ TypeScript compilation (strict mode, no errors)
- ✅ No runtime errors
- ✅ All features tested and working
- ✅ Responsive design verified
- ✅ Database operations validated
- ✅ Error handling implemented
- ✅ PWA manifest updated

---

## Contact & Support

For questions or issues, refer to the code comments and TypeScript types for implementation details. The modular architecture makes it easy to extend with new features.
