# Admin Features - Quick Start Guide

## Login as Administrator

1. Open HubFit app
2. Click "Login"
3. Enter credentials:
   - **Email:** `admin@hubfit.com`
   - **Password:** `admin123`
4. Click "Sign In"

## Access Admin Dashboard

After login, you'll see "Admin" option in navigation bar. Click it or go to `/admin-dashboard`

## User Management

### View All Users
- Click "User Management" tab in admin dashboard
- See all users with email, role, and creation date

### Create New User
1. Click "New User" button
2. Fill in form:
   - Email (required)
   - Name (required)
   - Password (required, min 6 chars)
   - Role (member/trainer/admin)
3. Click "Save"

### Edit User
1. Find user in table
2. Click edit icon (pencil)
3. Modify fields (password optional)
4. Click "Save"

### Change User Role
1. Find user in table
2. Click role dropdown
3. Select new role (member/trainer/admin)
4. Changes save immediately

### Delete Single User
1. Find user in table
2. Click delete icon (trash)
3. Confirm deletion

### Delete Multiple Users
1. Check boxes for users to delete
2. Click "Delete X" button
3. Confirm deletion

### Filter Users
1. Use "Filter by role" dropdown
2. Select: All Roles, Members, Trainers, or Admins
3. List updates instantly

## Class Management

### View All Classes
- Click "Class Management" tab in admin dashboard
- See all classes with trainer, date/time, capacity, waitlist

### Create New Class
1. Click "New Class" button
2. Fill in form:
   - Class Name (required)
   - Description (optional)
   - Trainer (required dropdown)
   - Date & Time (required)
   - Max Capacity (required, min 1)
3. Click "Save"

### Edit Class
1. Find class in list
2. Click edit icon (pencil)
3. Modify any fields
4. Click "Save"

### Delete Class
1. Find class in list
2. Click delete icon (trash)
3. Confirm deletion
4. Note: This removes all associated bookings

### Filter Classes
1. Use "Filter by trainer" dropdown
2. Select "All Trainers" or specific trainer name
3. List updates instantly

### Check Capacity
- See capacity info in each class card
- Format: `booked/max` (e.g., "12/20")
- Waitlist number shown separately

## Common Tasks

### Convert Member to Trainer
1. Go to User Management
2. Find the member
3. Click role dropdown
4. Select "Trainer"
5. Now can be assigned to classes

### Schedule New Class
1. Go to Class Management
2. Click "New Class"
3. Select trainer
4. Set date/time (must be future)
5. Set capacity based on studio space
6. Save

### Remove Trainer and Keep Classes
1. Change trainer's role to member
2. Go to Class Management
3. Edit classes assigned to that trainer
4. Reassign to different trainer
5. Can now delete trainer user if needed

### Handle Overcapacity
1. Go to Class Management
2. Edit the class
3. Increase "Max Capacity"
4. Save
5. This opens waitlist spots for confirmed spots

## Demo Data

### Existing Trainers (can assign to classes)
- Carlos Martínez (carlos@hubfit.com)
- Ana García (ana@hubfit.com)
- Jorge López (jorge@hubfit.com)
- Sofía Rodríguez (sofia@hubfit.com)

### Existing Members (for testing)
- Juan Pérez (juan@example.com)
- María González (maria@example.com)
- Carlos López (carlos@example.com)
- Laura Fernández (laura@example.com)
- Ana Martínez (ana@example.com)

## Tips & Tricks

- **Bulk delete:** Check multiple users, then click "Delete X"
- **Role dropdown:** Change roles instantly without edit form
- **Class capacity:** Shows real-time bookings/max
- **Date validation:** System prevents past dates
- **Email unique:** Can't create two users with same email
- **Trainer filter:** Easily find classes for specific trainer

## Troubleshooting

**Can't see Admin tab?**
- Make sure logged in as admin
- Reload page
- Check login credentials

**Form won't submit?**
- Check all required fields marked with *
- Password must be 6+ characters
- Email must have @ symbol
- Date must be in future

**Users/Classes not showing?**
- Refresh the page
- Check if filters are applied
- Wait a moment for loading to complete

**Can't delete class?**
- Close any open forms
- Try again, confirm deletion
- Check browser console for errors

## Important Notes

⚠️ **Deleting users removes all their bookings**
⚠️ **Deleting classes removes all associated bookings**
⚠️ **Deletions are permanent (no undo)**
⚠️ **Changes save immediately (no draft mode)**
✓ **All operations are logged server-side**

## Need More Info?

See detailed documentation in:
- `ADMIN_FEATURES_DOCUMENTATION.md` - Complete technical reference
- `ADMIN_IMPLEMENTATION_SUMMARY.md` - What was built and how

