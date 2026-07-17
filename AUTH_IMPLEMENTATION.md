# Authentication Implementation - HubFit v1

## Overview
Complete user authentication system with secure password hashing, session management, and role-based access control.

## Architecture

### Backend Authentication (Server)

#### Database Changes
- **Migration**: Added `password` (hashed) and `role` fields to `users` table
- **Password Security**: bcryptjs with salt rounds = 10
- **Roles**: `member`, `trainer`, `admin` (extensible)

#### Auth Service (`server/services/auth.ts`)
Implements:
- `signup(email, name, password)` - Creates new user with validation
- `login(email, password)` - Authenticates user and creates session
- `logout(token)` - Invalidates session
- `verifyToken(token)` - Validates session token and expiration
- `hashPassword(password)` - Bcryptjs hashing
- `verifyPassword(password, hash)` - Bcryptjs verification

**Session Management**:
- In-memory session store (Map-based)
- 24-hour expiration per session
- Automatic cleanup on expiry
- No sensitive data in tokens (secure random hex)

#### Auth Routes (`server/routes/auth.ts`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Session invalidation
- `POST /api/auth/verify` - Token verification

### Frontend Authentication (Client)

#### useAuth Hook (`client/src/hooks/useAuth.ts`)
Provides:
- `user: AuthUser | null` - Current authenticated user
- `token: string | null` - Active session token
- `isLoading: boolean` - Auth state initialization
- `error: string | null` - Auth error messages
- `signup(email, name, password)` - Registration
- `login(email, password)` - Authentication
- `logout()` - Sign out

**Storage Strategy**:
- Token stored in `localStorage` with key `hubfit_auth_token`
- Never store passwords in localStorage
- Auto-verify token on app load
- Automatic cleanup on logout/expiry

#### Protected Routes
- `ProtectedRoute` component prevents unauthorized access
- Automatic redirect to `/login` for unauthenticated users
- Loading state during auth initialization

#### Auth Pages
- **LoginPage** (`pages/LoginPage.tsx`) - Login form
- **SignupPage** (`pages/SignupPage.tsx`) - Registration form
- Demo credentials displayed for testing

### Navigation Updates
- User info displayed (name, email)
- Logout button in navbar
- Profile section with styling

## Validation

### Backend Validation
- Email uniqueness check
- Email format validation
- Password length >= 6 characters
- Required field validation
- Detailed error messages

### Frontend Validation
- All fields required
- Password confirmation match
- Password minimum length
- Email format
- Real-time validation feedback

## Demo Credentials
All demo users use password: `password123`

```
Email                   Name                 Role
juan@example.com        Juan Pérez           member
maria@example.com       María González       member
carlos@example.com      Carlos López         member
laura@example.com       Laura Fernández      member
ana@example.com         Ana Martínez         member
```

## Security Features

### Password Security
✅ Bcryptjs hashing with salt rounds = 10
✅ Never store plain text passwords
✅ Secure password comparison
✅ Minimum 6 character requirement

### Session Management
✅ Token-based sessions (not cookies)
✅ 24-hour expiration
✅ Automatic cleanup on logout
✅ Token verification on app load

### Data Protection
✅ Passwords never in localStorage
✅ Tokens not exposed in URL
✅ CORS-ready API design
✅ Input validation on both sides

### Authorization
✅ Protected routes require authentication
✅ Role-based user types (member/trainer/admin)
✅ Easy to extend with role-based endpoints

## Flow Diagrams

### Signup Flow
```
User fills signup form
    ↓
Frontend validation
    ↓
POST /api/auth/signup
    ↓
Backend:
  - Validate email/password
  - Check email uniqueness
  - Hash password (bcryptjs)
  - Create user
  - Generate session
    ↓
Return token + user data
    ↓
Store token in localStorage
    ↓
Redirect to /classes
```

### Login Flow
```
User fills login form
    ↓
Frontend validation
    ↓
POST /api/auth/login
    ↓
Backend:
  - Find user by email
  - Compare password (bcryptjs)
  - Create session
  - Generate token
    ↓
Return token + user data
    ↓
Store token in localStorage
    ↓
Redirect to /classes
```

### Session Verification (App Load)
```
App mounts
    ↓
Check localStorage for token
    ↓
POST /api/auth/verify
    ↓
Backend:
  - Lookup session
  - Check expiration
  - Return user data
    ↓
Set authenticated user state
    ↓
Show protected content
```

### Logout Flow
```
User clicks logout
    ↓
POST /api/auth/logout (optional)
    ↓
Remove token from localStorage
    ↓
Clear user state
    ↓
Redirect to /login
```

## Integration with Existing Code

### Bookings Routes
- Currently expects `userId` in request body
- Should be updated to use authenticated user ID from session
- Future: Add authentication middleware to validate tokens

### Classes Routes
- Independent of auth, returns all classes
- Works correctly with current implementation

### Database
- Existing bookings/classes unaffected
- Demo data seeded with hashed passwords
- Migration handles password field addition

## Testing the Implementation

### Test Signup
```bash
POST http://localhost:3001/api/auth/signup
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "password123"
}
```

### Test Login
```bash
POST http://localhost:3001/api/auth/login
{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Test Verify
```bash
POST http://localhost:3001/api/auth/verify
{
  "token": "from_login_response"
}
```

## Future Enhancements
- [ ] JWT tokens instead of random hex (stateless)
- [ ] Database session storage (for scaling)
- [ ] Refresh tokens (long-lived)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Rate limiting on auth endpoints
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts

## Files Modified/Created
- `server/services/auth.ts` (NEW)
- `server/routes/auth.ts` (NEW)
- `server/db/types.ts` (UPDATED - added password, role)
- `server/db/seed.ts` (UPDATED - hash passwords)
- `server/index.ts` (UPDATED - add auth routes)
- `client/src/hooks/useAuth.ts` (NEW)
- `client/src/hooks/useCurrentUser.ts` (UPDATED)
- `client/src/pages/LoginPage.tsx` (NEW)
- `client/src/pages/SignupPage.tsx` (NEW)
- `client/src/components/Navigation.tsx` (UPDATED - logout)
- `client/src/App.tsx` (UPDATED - routing & protection)
- Database migration: Add password and role fields
