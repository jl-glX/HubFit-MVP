# HubFit - Gym Class Reservation System v1.0

A modern, responsive web application for managing gym class bookings, waitlists, and automatic promotion.

## Quick Start

```bash
# Start development servers
npm start

# Build for production
npm run build

# Lint, type-check, and build
npm run check
```

**Demo user:** Juan Perez (juan@example.com)

---

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - 5 min intro for users
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Complete developer guide
- [HUBFIT_SUMMARY.md](./HUBFIT_SUMMARY.md) - Architecture and overview
- [PROJECT_COMPLETION_CHECKLIST.md](./PROJECT_COMPLETION_CHECKLIST.md) - What's implemented

---

## Features

### Core Functionality
- Class Calendar - Browse classes organized by date and time
- Booking System - Reserve spots instantly when available
- Smart Waitlist - Automatically join waitlist when full
- Auto-Promotion - First in waitlist promoted when spots open
- Booking Management - View and cancel reservations
- Authentication with member, trainer, and administrator roles
- Role-based management and analytics dashboards

### Technical
- TypeScript 6 client and server validation
- ESLint 10 with React and TypeScript rules
- Modular architecture
- React 19 + Vite 8 frontend
- Tailwind CSS 4
- Express 5 API backend
- SQLite database
- Responsive design
- Progressive Web App

---

## Architecture

### Tech Stack
- Frontend: React 19, TypeScript 6, Vite 8, Tailwind CSS 4, shadcn/ui
- Backend: Node.js, Express 5, TypeScript
- Database: SQLite with Kysely query builder

### Folder Structure
```
client/src/               Frontend application
  pages/                 Page components
  components/            UI components
  hooks/                 Custom hooks
  lib/                   Utilities

server/                   Backend application
  db/                    Database layer
  routes/                API endpoints
  services/              Business logic

data/                     Database storage
  database.sqlite        Generated SQLite file (not versioned)
```

---

## API Endpoints

Classes:
- GET /api/classes - Get all classes
- GET /api/classes/:id - Get single class

Bookings:
- POST /api/bookings - Create booking
- DELETE /api/bookings/:id - Cancel booking
- GET /api/bookings/user/:id - Get user bookings
- GET /api/bookings/class/:id - Get class attendees

Analytics:
- GET /api/analytics/daily - Daily booking and occupancy metrics
- GET /api/analytics/weekly - Weekly metrics
- GET /api/analytics/monthly - Monthly metrics
- GET /api/analytics/class-popularity - Class popularity
- GET /api/analytics/peak-hours - Peak usage hours

---

## Demo Data

- 5 Demo Users (Juan, Maria, Carlos, Laura, Ana)
- 7 Days of Classes (175 total)
- 6 Class Types (Yoga, HIIT, Pilates, Spinning, Boxing, Zumba)
- 4 Trainers
- Pre-booked Classes

---

## Project Status

Status: PRODUCTION READY v1.0

All features implemented:
- Class calendar with bookings
- Booking system with instant confirmation
- Waitlist management with FIFO
- Automatic promotion on cancellation
- Responsive mobile-first UI
- Full TypeScript coverage
- Complete API implementation
- SQLite database with proper schema
- Error handling throughout

---

## Key Files

Frontend:
- client/src/App.tsx - Router setup
- client/src/pages/ClassesPage.tsx - Main feature
- client/src/components/ClassCard.tsx - Class display
- client/src/hooks/useBookings.ts - Booking logic

Backend:
- server/index.ts - Express setup
- server/services/booking.ts - Business logic
- server/routes/bookings.ts - API endpoints
- server/db/client.ts - Database setup

---

## Development

```bash
npm start              # Dev servers
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # Client and server TypeScript
npm run check         # Full local verification
```

---

## Limitations (v1.0)

- Sessions are stored in memory and reset when the server restarts
- No real-time notifications
- No email/SMS alerts

See PROJECT_COMPLETION_CHECKLIST.md for future features.

---

## Support

For detailed information, see the documentation files above.
