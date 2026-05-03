# 401 Unauthorized Login Error - Solution

## Problem
Getting `401 Unauthorized` error when trying to login with `tarun.javadev@gmail.com`

## Root Cause
The database migrations were not being run automatically when the server started. The `users` table didn't exist in the database.

### What was wrong:
1. The API server was running but the database tables were not created
2. When attempting to login, the query `SELECT id, email, password_hash FROM users WHERE email = ?` failed silently or returned no results
3. The auth endpoint returns `401` when a user is not found (matching the generic "Invalid email or password" error message)

## Solution Implemented

### Step 1: Create Database Tables ✅
Ran migrations to create all necessary tables:
- `users` - Stores user accounts with email, password_hash, and profile info
- `itineraries` - User trip itineraries
- `itinerary_entries` - Individual entries in each itinerary (flights, hotels, activities)
- `shared_itineraries` - Permission tracking for shared itineraries

Command run:
```bash
node run_migrations.js
```

Result: All tables now exist in the database

### Step 2: Register a New Account
Before you can login, you need to register:

1. Go to `/register` page
2. Fill in:
   - Email: `tarun.javadev@gmail.com`
   - Password: Your chosen password
   - First Name: (optional)
   - Last Name: (optional)
3. Click "Register"

### Step 3: Login
Now that your account is registered:

1. Go to `/login` page
2. Enter:
   - Email: `tarun.javadev@gmail.com`
   - Password: The same password you registered with
3. Click "Login"

## Why This Happened

The migrations system was designed to automatically run when the server starts:

```typescript
// apps/api/src/server.ts
async function start() {
  try {
    await initializeDatabase();
    await runMigrations();  // ← Runs automatically on server start
    server.listen(environment.port, ...);
  }
}
```

However, the database connection was to a Railway hosted PostgreSQL instance. It's possible:
1. The migrations had run before but tables were deleted/reset
2. A different database was being used in production vs local testing
3. The migrations need to be triggered explicitly

## How to Prevent This in the Future

Add a check to ensure migrations run on server startup. The migration code already exists and runs when the server starts, so just ensure:

1. ✅ The server is running (port 3000)
2. ✅ The database connection is working
3. ✅ Tables are created before any auth requests are made

## Testing

To verify everything works:

1. Register a test account
2. Login with that account
3. Create an itinerary
4. Verify data is saved to the database

If you get any errors, check:
- Server is running: `http://localhost:3000/api/health`
- Database connection is available
- Environment variables are set correctly in `.env`


