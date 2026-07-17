# HubFit - Quick Start Guide

## What is HubFit?
A gym class reservation system that allows users to book fitness classes, manage waitlists, and get automatically promoted when spots open up.

## Start Development

```bash
# Start both frontend and backend servers
npm start
```

Then open your browser:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api

## Try It Out

### 1. Home Page (http://localhost:3000)
- See app features and introduction
- Two buttons to get started

### 2. Browse Classes (http://localhost:3000/classes)
- All classes for the next 7 days
- Organized by date
- Shows trainer, time, capacity, availability
- Click "Book" to reserve a spot

### 3. My Bookings (http://localhost:3000/my-bookings)
- See all your reservations
- View waitlist status if applicable
- Click trash icon to cancel bookings

## Demo User
```
Name: Juan Pérez
Email: juan@example.com
```

(In production, you'd login first)

## Key Features to Test

### ✅ Booking a Class
1. Go to Classes
2. Click "Book" on any available class
3. Check My Bookings - it appears there!

### ✅ Joining Waitlist
1. Find a full class (red "Join Waitlist" button)
2. Click to join
3. Status shows as "On Waitlist" in My Bookings

### ✅ Automatic Promotion
1. Have someone booked in a full class
2. Cancel their booking
3. First person in waitlist automatically gets promoted!

### ✅ Cancelling Bookings
1. Go to My Bookings
2. Click trash icon next to any booking
3. Booking removed (and waitlist updated if applicable)

## Architecture Overview

```
Frontend (React + TypeScript)
        ↕ HTTP API
Backend (Express + TypeScript)
        ↕ SQL
Database (SQLite)
```

## File Locations

### Frontend
- Pages: `client/src/pages/`
- Components: `client/src/components/`
- Logic: `client/src/hooks/`

### Backend
- Routes: `server/routes/`
- Database: `server/db/`
- Business Logic: `server/services/`

## API Endpoints Quick Reference

```
GET /api/classes              # Get all classes
POST /api/bookings            # Create booking
DELETE /api/bookings/:id      # Cancel booking
GET /api/bookings/user/:id    # Get user bookings
```

## Common Tasks

### See Database Content
```bash
# While server is running, the database is in:
# /home/app/data/database.sqlite
```

### Reset Data
```bash
# 1. Stop the dev server (Ctrl+C)
# 2. Delete the database:
rm /home/app/data/database.sqlite

# 3. Restart with npm start
# Database recreates and reseeds automatically
```

### Test with Different User
Edit `client/src/hooks/useCurrentUser.ts` to change the demo user ID.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| Classes not showing | Check server logs, restart with `npm start` |
| Booking fails | Refresh page, check if already booked |
| Database error | Delete database, restart |

## Next Steps

1. **Read Full Docs**
   - `HUBFIT_SUMMARY.md` - Complete overview
   - `DEVELOPMENT.md` - Developer guide

2. **Explore Code**
   - Start with `App.tsx` to see routes
   - Check `ClassesPage.tsx` for main functionality
   - Review `booking.ts` for business logic

3. **Make Changes**
   - Frontend: Edit components and refresh
   - Backend: Edit routes and restart server
   - Database: Update schema in `db/client.ts`

4. **Build for Production**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

## Demo Data Included

- **5 Demo Users** ready to test
- **7 Days of Classes** (175 total)
- **6 Class Types** (Yoga, HIIT, Pilates, Spinning, Boxing, Zumba)
- **4 Trainers** rotating through classes
- **Pre-booked Classes** showing capacity

## Support

For detailed information:
- Architecture: See `HUBFIT_SUMMARY.md`
- Development: See `DEVELOPMENT.md`
- Completion: See `PROJECT_COMPLETION_CHECKLIST.md`

---

**Enjoy HubFit! 🏋️‍♀️**
