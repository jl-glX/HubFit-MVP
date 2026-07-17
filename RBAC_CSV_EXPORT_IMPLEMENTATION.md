# Role-Based Navigation & CSV Export Implementation

## Overview
This implementation adds role-based navigation and CSV export functionality to HubFit.

## Changes Made

### 1. Role-Based Navigation (Frontend)

#### Navigation Component (`client/src/components/Navigation.tsx`)
- Added role badge display (admin/trainer/member) with color coding
  - Admin: Purple
  - Trainer: Blue
  - Member: Gray
- Dynamic navigation menu based on user role:
  - All users: Home, Classes, My Bookings
  - Trainers: Dashboard tab
  - Admins: Admin tab
- Visual role indicator in user profile section

#### Protected Routes (`client/src/App.tsx`)
- Enhanced `ProtectedRoute` component with role validation
- Supports single role and multiple roles via array
- `/trainer-dashboard` route requires "trainer" role
- `/admin-dashboard` route requires "admin" role
- Redirects unauthorized users to `/unauthorized` page
- Route protection happens before rendering, preventing access via URL manipulation

#### Unauthorized Page (`client/src/pages/UnauthorizedPage.tsx`)
- Displays when user tries to access restricted routes
- Shows clear message about permission denied
- Provides navigation back to home page

#### Admin Dashboard (`client/src/pages/AdminDashboardPage.tsx`)
- Placeholder for future admin features
- Follows same pattern as Trainer Dashboard
- Protected by admin role

### 2. CSV Export Functionality

#### Class Details Modal (`client/src/components/ClassDetailsModal.tsx`)
- Added "Export CSV" button visible only to trainers and admins
- Button uses lucide-react Download icon
- Downloads file with format: `attendees-{classname}-{date}.csv`
- File uses UTF-8 encoding

#### Backend Routes (`server/routes/bookings.ts`)
- New route: `GET /api/bookings/class/:classId/export-csv`
- Route comes before POST/DELETE to avoid path conflicts
- Returns CSV file with proper headers:
  - `Content-Type: text/csv;charset=utf-8`
  - `Content-Disposition: attachment`

#### Booking Service (`server/services/booking.ts`)
- New function: `exportClassAttendeesCsv(classId: string)`
- Returns properly formatted CSV with:
  - Headers: Name, Email, Status, Waitlist Position
  - Confirmed attendees listed first (Status: "Confirmed")
  - Waitlist entries with position numbers (Status: "Waitlist")
  - Proper quote escaping for names containing special characters

#### CSV Format
```csv
"Name","Email","Status","Waitlist Position"
"John Doe","john@example.com","Confirmed",""
"Jane Smith","jane@example.com","Waitlist","1"
"Bob Johnson","bob@example.com","Waitlist","2"
```

## Architectural Improvements

### Type Safety
- `UserRole` type definition for consistent role checking
- `ProtectedRouteProps` interface for type-safe route protection
- CSV escaping function to prevent injection

### Clean Code
- Separation of concerns:
  - Navigation logic in component
  - Route protection in App
  - Business logic in services
- Reusable `ProtectedRoute` component
- Consistent error handling

### Security
- Role validation happens on both frontend and backend routes
- URL access attempts to restricted routes are blocked
- CSV file includes only authorized class data
- No token exposure in exports

## File Structure

```
client/src/
├── App.tsx (updated with ProtectedRoute)
├── components/
│   ├── Navigation.tsx (role-based menu)
│   └── ClassDetailsModal.tsx (CSV export button)
└── pages/
    ├── UnauthorizedPage.tsx (new)
    └── AdminDashboardPage.tsx (new)

server/
├── routes/
│   └── bookings.ts (new CSV export route)
└── services/
    └── booking.ts (new export function)
```

## Testing Notes

### Navigation
- Login as member: See Home, Classes, My Bookings
- Login as trainer: See Dashboard tab
- Login as admin: See Admin tab
- Role badge displays correctly for each user type

### Route Protection
- Direct URL access to `/trainer-dashboard` as member: Redirected to unauthorized page
- Direct URL access to `/admin-dashboard` as member: Redirected to unauthorized page
- Access with correct role: Page loads normally

### CSV Export
- Only Export button visible for trainer and admin users
- Member users don't see the button
- Export creates properly formatted CSV file
- File downloads with correct name and encoding

## Future Enhancements

1. Admin Dashboard implementation (currently placeholder)
2. Role management UI
3. Additional export formats (PDF, Excel)
4. Bulk operations on class attendees
5. Advanced filtering in trainer dashboard
6. User management interface for admins

## Database Schema Notes

Current role values: `"member" | "trainer" | "admin"`
- Can be extended with additional roles if needed
- No database changes required for this implementation
