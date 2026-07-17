# Admin Features Implementation - HubFit

## Overview

This document describes the user management and class management features implemented for HubFit administrators.

## Features Implemented

### 1. User Management

**Location:** `/admin-dashboard` → User Management tab

#### Features:
- **View all users** with email, role, and creation date
- **Create new users** with email, name, password, and role assignment
- **Edit existing users** (name, email, password, role)
- **Change user roles** individually (member → trainer → admin)
- **Delete single users** with confirmation
- **Bulk delete users** with multi-select
- **Filter users by role** (All, Members, Trainers, Admins)

#### Technical Implementation:
- **Frontend Components:**
  - `UserManagement.tsx` - Main user list and management interface
  - `UserForm.tsx` - Create/edit user modal form
- **Frontend Hooks:**
  - `useUsers.ts` - User data fetching and CRUD operations
- **Backend Routes:**
  - `GET /api/users` - Fetch all users
  - `GET /api/users/:id` - Fetch single user
  - `POST /api/users` - Create user
  - `PUT /api/users/:id` - Update user (email, name, password, role)
  - `PATCH /api/users/:id/role` - Change user role
  - `DELETE /api/users/:id` - Delete single user
  - `POST /api/users/bulk/delete` - Delete multiple users
- **Backend Services:**
  - `server/services/users.ts` - User business logic and database operations
  - `server/routes/users.ts` - API endpoint handlers

#### Database Operations:
- When deleting a user:
  - All user's bookings are deleted
  - All user's waitlist entries are deleted
  - User record is deleted

#### Demo Credentials:
Admin account is automatically seeded:
- Email: `admin@hubfit.com`
- Password: `admin123`
- Role: `admin`

### 2. Class Management

**Location:** `/admin-dashboard` → Class Management tab

#### Features:
- **View all classes** with trainer, date/time, capacity, and waitlist count
- **Create new classes** with all details
- **Edit existing classes** (name, description, trainer, date/time, capacity)
- **Delete classes** with confirmation
- **Filter classes by trainer**
- **Real-time capacity tracking** (booked/max capacity)
- **Waitlist visibility** (number of users waiting)

#### Technical Implementation:
- **Frontend Components:**
  - `ClassManagement.tsx` - Main class list and management interface
  - `ClassForm.tsx` - Create/edit class modal form
- **Frontend Hooks:**
  - `useAdminClasses.ts` - Class data fetching and CRUD operations
- **Backend Routes:**
  - `GET /api/admin/classes` - Fetch all classes
  - `GET /api/admin/classes/:id` - Fetch single class
  - `POST /api/admin/classes` - Create class
  - `PUT /api/admin/classes/:id` - Update class
  - `DELETE /api/admin/classes/:id` - Delete class
- **Backend Services:**
  - `server/services/classes.ts` - Class business logic and database operations
  - `server/routes/admin-classes.ts` - API endpoint handlers

#### Validations:
- Class name is required
- Trainer assignment is required
- Max capacity must be at least 1
- Class date must be in the future
- Email validation when creating/editing classes

#### Database Operations:
- When deleting a class:
  - All associated bookings are deleted
  - All associated waitlist entries are deleted
  - Class record is deleted

### 3. Role-Based Access Control

Protected routes enforce admin-only access:
- `/admin-dashboard` - Only accessible by admin users
- Attempting to access as non-admin redirects to `/unauthorized`
- All user management APIs can only be called by admins (in production, add auth middleware)

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "member" | "trainer" | "admin";
  createdAt: number;
}
```

### Class (Admin View)
```typescript
interface AdminClass {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  trainerName: string;
  maxCapacity: number;
  scheduledAt: number;
  bookedCount: number;
  availablePlaces: number;
  waitlistCount: number;
}
```

## Integration with Existing System

### User System
- Uses existing authentication and password hashing (`bcryptjs`)
- Session tokens stored in-memory on server
- Works with existing role system (member/trainer/admin)
- Integrates with existing user database

### Class System
- Uses existing class booking system
- Respects existing trainer assignments
- Maintains availability calculations
- Integrates with waitlist management

### Bookings
- Admin deletions of classes cascade to delete all bookings
- User deletions cascade to delete user's bookings
- No changes to booking system itself

## API Endpoints Summary

### User Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users` | Fetch all users |
| GET | `/api/users/:id` | Fetch single user |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user details |
| PATCH | `/api/users/:id/role` | Change user role |
| DELETE | `/api/users/:id` | Delete single user |
| POST | `/api/users/bulk/delete` | Delete multiple users |

### Class Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/classes` | Fetch all classes |
| GET | `/api/admin/classes/:id` | Fetch single class |
| POST | `/api/admin/classes` | Create new class |
| PUT | `/api/admin/classes/:id` | Update class |
| DELETE | `/api/admin/classes/:id` | Delete class |

## Current Limitations

1. **No API authentication middleware** - In production, add middleware to verify admin role for these endpoints
2. **No audit logging** - User/class changes are not logged
3. **No soft deletes** - Deletions are permanent (no restore capability)
4. **No pagination** - All users and classes load in single request
5. **No batch operations** beyond bulk delete
6. **No advanced filtering** - Only basic role/trainer filtering available
7. **No search functionality** - Must filter or scroll through full list
8. **In-memory sessions** - Server restart loses all sessions (no persistence)

## Security Considerations

### Current Implementation
- Passwords are hashed with bcryptjs (10 salt rounds)
- Admin credentials provided only in seed data
- Token-based session management
- Protected routes check user role client-side

### Production Recommendations
1. Add auth middleware to all admin API endpoints
2. Implement proper audit logging for admin actions
3. Add rate limiting on user creation/deletion
4. Implement database-persisted sessions
5. Add email verification for new users
6. Implement password reset functionality
7. Add two-factor authentication for admin accounts
8. Log all admin actions for compliance

## Future Enhancements

1. **User Management**
   - Search functionality
   - Pagination
   - Bulk role assignment
   - Email verification
   - Password reset
   - Soft deletes with restore
   - Activity audit log

2. **Class Management**
   - Advanced filtering (date range, capacity range, etc.)
   - Class templates/recurring classes
   - Bulk class creation
   - Class archive instead of delete
   - Capacity overrides
   - Automatic waitlist promotion

3. **Admin Tools**
   - Dashboard statistics (total users, upcoming classes, etc.)
   - User activity tracking
   - Class attendance reports
   - Revenue/booking analytics
   - System logs viewer

## Testing

### Test Credentials
```
Admin:
- Email: admin@hubfit.com
- Password: admin123

Trainer Examples:
- carlos@hubfit.com / password123
- ana@hubfit.com / password123
- jorge@hubfit.com / password123
- sofia@hubfit.com / password123

Member Examples:
- juan@example.com / password123
- maria@example.com / password123
- carlos@example.com / password123
- laura@example.com / password123
- ana@example.com / password123
```

## File Structure

```
Server:
├── server/
│   ├── routes/
│   │   ├── users.ts (NEW)
│   │   └── admin-classes.ts (NEW)
│   ├── services/
│   │   ├── users.ts (NEW)
│   │   └── classes.ts (NEW)
│   └── db/
│       └── seed.ts (MODIFIED - added admin user)

Client:
├── client/src/
│   ├── components/
│   │   ├── UserManagement.tsx (NEW)
│   │   ├── UserForm.tsx (NEW)
│   │   ├── ClassManagement.tsx (NEW)
│   │   └── ClassForm.tsx (NEW)
│   ├── hooks/
│   │   ├── useUsers.ts (NEW)
│   │   └── useAdminClasses.ts (NEW)
│   └── pages/
│       └── AdminDashboardPage.tsx (MODIFIED)
```

