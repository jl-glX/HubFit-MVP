# HubFit Development Guide

## Quick Start

```bash
# Install dependencies (already done)
npm install

# Start development servers
npm start
# Vite: http://localhost:3000
# Express API: http://localhost:3001

# Build for production
npm run build
```

---

## Project Structure Guide

### Adding a New Page
1. Create component in `client/src/pages/MyNewPage.tsx`
2. Add route in `client/src/App.tsx`:
   ```typescript
   <Route path="/my-new-page" element={<MyNewPage />} />
   ```
3. Update navigation in `client/src/components/Navigation.tsx`

### Adding a New API Endpoint
1. Create route file in `server/routes/myroute.ts`
2. Export router and import in `server/index.ts`:
   ```typescript
   app.use("/api/myroute", myrouter);
   ```

### Adding a New Database Table
1. Add interface to `server/db/types.ts`
2. Add to `Database` interface
3. Create table in `server/db/client.ts` → `initializeDatabase()`
4. (Optional) Add seed data to `server/db/seed.ts`

### Creating a Reusable Component
1. Create in `client/src/components/MyComponent.tsx`
2. Keep files small (< 50 lines)
3. Export from component file
4. Import with relative path in other components

---

## Key Patterns

### Custom Hooks Pattern
```typescript
// useMyFeature.ts
export function useMyFeature() {
  const [state, setState] = useState<Type>(initial);
  
  const action = async () => {
    // Implementation
  };
  
  return { state, action };
}

// In component
const { state, action } = useMyFeature();
```

### API Calling Pattern
```typescript
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "value" }),
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error);
}

const result = await response.json();
```

### Database Query Pattern
```typescript
// Select
const items = await db
  .selectFrom("tableName")
  .select(["col1", "col2"])
  .where("id", "=", value)
  .execute();

// Insert
await db
  .insertInto("tableName")
  .values({ col1: val1, col2: val2 })
  .execute();

// Update
await db
  .updateTable("tableName")
  .set({ col1: newVal })
  .where("id", "=", id)
  .execute();

// Delete
await db
  .deleteFrom("tableName")
  .where("id", "=", id)
  .execute();
```

---

## Component Hierarchy

```
App
├── Navigation
└── Routes
    ├── HomePage
    │   └── (UI sections)
    ├── ClassesPage
    │   └── ClassCard (multiple)
    └── MyBookingsPage
        └── UserBookings
            └── (booking items)
```

---

## State Management Flow

```
User Action
    ↓
Component Handler
    ↓
useHook Function
    ↓
API Fetch
    ↓
Server Route
    ↓
Database Service
    ↓
SQLite (Kysely)
    ↓
Back through chain with results
    ↓
Component Re-render
```

---

## Important Constants

### Class Times (server/db/seed.ts)
```typescript
const times = [9, 11, 16, 18, 20]; // Hours for daily classes
```

### Class Types (server/db/seed.ts)
```typescript
const CLASS_TYPES = [
  { name: "Yoga Flow", description: "..." },
  // ... 6 types total
];
```

### Demo Users (server/db/seed.ts)
```typescript
const DEMO_USERS = [
  { id: "user-demo-1", email: "juan@example.com", name: "Juan Pérez" },
  // ... 5 users total
];
```

---

## Common Tasks

### Check Database State
```typescript
// In server route for testing
const allBookings = await db.selectFrom("bookings").selectAll().execute();
console.log(allBookings);
```

### Clear Demo Data & Re-seed
1. Delete `/home/app/data/database.sqlite`
2. Restart dev server with `npm start`
3. Database will be recreated and seeded automatically

### Add New User
```typescript
// In seed.ts or API endpoint
await db
  .insertInto("users")
  .values({
    id: generateId(),
    email: "new@example.com",
    name: "New User",
    createdAt: Date.now(),
  })
  .execute();
```

### Test Waitlist Promotion
1. Book a full class (class is "full")
2. Add yourself to waitlist
3. Open another user's bookings
4. Cancel their booking in that class
5. Your status should change to "confirmed" (refresh page)

---

## Debugging Tips

### Check Server Logs
- Database queries logged automatically (Kysely logger)
- Express console output shows request handling
- Error stack traces show issue locations

### Frontend Debugging
- React DevTools extension helpful
- Network tab shows API calls and responses
- Browser console shows component errors

### Database Inspection
```typescript
// Add to test routes
app.get("/api/debug/tables", async (req, res) => {
  const tables = await db
    .selectFrom("bookings")
    .selectAll()
    .execute();
  res.json(tables);
});
```

---

## Performance Considerations

1. **Indexes**: Already added on frequently queried columns
   - `users.email`
   - `gymClasses.scheduledAt`
   - `bookings.classId`, `bookings.userId`, `bookings.status`
   - `waitlistEntries.classId`, `waitlistEntries.userId`

2. **Query Optimization**: Use `limit()` for large result sets

3. **Component Optimization**: 
   - Use `useCallback` for event handlers
   - Avoid inline function definitions
   - Split large components into smaller ones

---

## Deployment Notes

1. Set `NODE_ENV=production` before build
2. Build static files: `npm run build`
3. Serve from `/home/app/dist` for frontend
4. Express starts on `PORT=4000` (configurable)
5. Database persists in `DATA_DIRECTORY`

---

## Testing Workflows

### Complete Booking Flow
1. Go to `/classes`
2. Click "Book" on any class
3. Verify booking appears in `/my-bookings`
4. Cancel booking
5. Verify removal from active bookings

### Waitlist Flow
1. Fill up a class completely
2. Try to book → should go to waitlist
3. Cancel a confirmed booking
4. Refresh page → waitlisted user should be promoted

### Multiple User Testing
1. Update `useCurrentUser` to switch users
2. Reload page and test different scenarios
3. Or modify seed data to create test accounts

---

## Code Style

- Use TypeScript strict mode (no `any` types)
- Double quotes for strings
- Explicit prop types (no spreading `...props`)
- Function handlers always (no inline arrows)
- Descriptive variable names
- Comments for complex logic only

---

## PWA Configuration

The app is a Progressive Web App. Update `client/public/site.webmanifest` when changing:
- App name → `"name"` and `"short_name"`
- Colors → `"theme_color"` and `"background_color"`
- Icons → `"icons"` array

Currently configured:
- Name: "HubFit - Gym Classes"
- Theme: Dark slate (#0f172a)
- Background: White

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000/3001 in use | Kill process or change PORT env var |
| Database locked | Delete database.sqlite, restart |
| Import errors | Check relative paths (no @/ aliases) |
| Type errors | Run `npm run build` to see full errors |
| Classes not showing | Check seed ran: look for log output |

---

## Additional Resources

- Kysely Docs: https://kysely.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Express API: https://expressjs.com
