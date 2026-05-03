# ON DELETE CASCADE - Complete FAQ

## Quick Answer
**Are tables deleting on system restart/shutdown?**
❌ **NO, absolutely not!** Your data is permanently stored in the database.

`ON DELETE CASCADE` only activates when you **explicitly DELETE** a parent record from the database.

---

## What is ON DELETE CASCADE?

A **database constraint** that automatically deletes child records when a parent record is deleted.

### Database Relationship Structure

```
┌─────────────────────────────────────────────────┐
│                   USERS TABLE                    │
│  ┌──────────────────────────────────────────┐  │
│  │ id (PRIMARY KEY)                         │  │
│  │ email                                    │  │
│  │ password_hash                            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────┘
                      │
      (ON DELETE CASCADE)
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               ITINERARIES TABLE                  │
│  ┌──────────────────────────────────────────┐  │
│  │ id (PRIMARY KEY)                         │  │
│  │ user_id (FOREIGN KEY → users.id) ◄──────┼──┼──────┐
│  │ title                                    │  │      │
│  │ start_date                               │  │      │
│  └──────────────────────────────────────────┘  │      │
└─────────────────────┬──────────────────────────┘      │
                      │                                  │
      (ON DELETE CASCADE)                                │
                      │                                  │
                      ▼                                  │
┌─────────────────────────────────────────────────┐    │
│            ITINERARY_ENTRIES TABLE               │    │
│  ┌──────────────────────────────────────────┐  │    │
│  │ id (PRIMARY KEY)                         │  │    │
│  │ itinerary_id (FOREIGN KEY) ◄─────────────┼──┼────┤
│  │ title (Flight, Hotel, Activity)          │  │    │
│  │ category                                 │  │    │
│  │ custom_details (JSON)                    │  │    │
│  └──────────────────────────────────────────┘  │    │
└──────────────────────────────────────────────────┘    │
                                                         │
┌──────────────────────────────────────────────────┐    │
│          SHARED_ITINERARIES TABLE                │    │
│  ┌────────────────────────────────────────────┐ │    │
│  │ id (PRIMARY KEY)                           │ │    │
│  │ itinerary_id (FOREIGN KEY) ◄───────────────┼─┼────┤
│  │ shared_with_user_id (FOREIGN KEY) ◄────────┼─┼────┘
│  │ permission (view/edit)                     │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## When Does ON DELETE CASCADE Activate?

### ✅ ONLY When You DELETE a Parent Record

**Example 1: Deleting a User**

```javascript
// User calls API to delete their account
DELETE FROM users WHERE email = 'tarun.javadev@gmail.com';
```

**What Happens Automatically:**
1. ✅ User record deleted
2. ✅ All their itineraries deleted (CASCADE from users → itineraries)
3. ✅ All entries in those itineraries deleted (CASCADE from itineraries → entries)
4. ✅ All shared itinerary records deleted (CASCADE from users/itineraries → shared)

---

**Example 2: Deleting an Itinerary**

```javascript
// DELETE /api/itineraries/{id}
DELETE FROM itineraries WHERE id = 'itr_avh0nlqz';
```

**What Happens Automatically:**
1. ✅ Itinerary record deleted
2. ✅ All its itinerary_entries deleted (flights, hotels, activities)
3. ✅ All shared_itineraries records deleted

---

### ❌ Does NOT Activate For:

- ❌ System restart
- ❌ System shutdown
- ❌ Database restart
- ❌ Database shutdown
- ❌ Application crash
- ❌ Network disconnection
- ❌ Power loss
- ❌ Any event that doesn't involve an explicit DELETE SQL command

---

## Data Persistence Flow

### Timeline of Your Data

```
TIME 0: User registers
├─ Create user account → STORED IN DATABASE ✅
└─ Data written to disk

TIME 1-10 MINUTES: User creates itineraries
├─ Create itinerary → STORED IN DATABASE ✅
├─ Add flights, hotels → STORED IN DATABASE ✅
└─ Data written to disk

TIME 30: Server restarts 
├─ Node.js application stops
├─ Connection to database closes
├─ Database connection closes
└─ ⚠️ BUT ALL DATA REMAINS ON DATABASE DISK ✅

TIME 31: Server starts again
├─ Node.js reconnects to database
├─ All your data is STILL THERE ✅
└─ You can query and use it normally

TIME 60: User shares an itinerary
├─ Create shared_itinerary record → STORED IN DATABASE ✅
└─ Data written to disk

TIME 120: User deletes itinerary via API
├─ DELETE FROM itineraries WHERE id = 'itr_xxx'
├─ ON DELETE CASCADE triggers automatically
├─ ✅ Itinerary deleted
├─ ✅ Entries deleted  
├─ ✅ Shares deleted
└─ Changes written to disk
```

---

## Why Is ON DELETE CASCADE Important?

### Problem Without It:
If you delete a user WITHOUT cascade:
```
users table: User deleted ✅
itineraries table: User's itineraries STILL EXIST ❌ (orphaned)
itinerary_entries table: Entries STILL EXIST ❌ (orphaned)
shared_itineraries table: Shares STILL EXIST ❌ (orphaned)

→ Database now has ORPHANED DATA pointing to non-existent users
```

### Solution With ON DELETE CASCADE:
If you delete a user WITH cascade:
```
users table: User deleted ✅
↓ (CASCADE)
itineraries table: User's itineraries deleted ✅
↓ (CASCADE)
itinerary_entries table: Entries deleted ✅
shared_itineraries table: Shares deleted ✅

→ Database is CLEAN, no orphaned data
```

---

## Real-World Analogy

Think of it like a paper filing system:

```
FILE CABINET (Database)
├── Folder "User John" 📁
│   ├── File "Trip to Paris" 📄 (ON DELETE CASCADE)
│   │   ├── Document "Flight details" 📃
│   │   ├── Document "Hotel booking" 📃
│   │   └── Document "Activities" 📃
│   └── File "Trip to London" 📁 (ON DELETE CASCADE)
│       └── Documents...
└── Folder "Shared Trips" 📁
    └── Record "Paris trip shared with Sarah" 📄 (ON DELETE CASCADE)

SCENARIO: Janitor unplugs the filing cabinet (System Shutdown)
→ Files are STILL IN THE CABINET ✅
→ Nothing deleted

SCENARIO: Accountant says "Delete User John's records"
→ Removes entire "User John" folder
→ ON DELETE CASCADE kicks in
→ All subfolders and documents are removed too
→ Shared records for John's trips are removed
→ File system is CLEAN ✅
```

---

## Database Durability Guarantee

Your PostgreSQL database has multiple layers of protection:

### Layer 1: In-Memory Write Buffer
```
Application writes data
→ PostgreSQL receives it
→ Writes to in-memory buffer (fast)
```

### Layer 2: WAL (Write-Ahead Log)
```
Before data is moved to main disk
→ PostgreSQL writes to WAL journal file (persistent)
→ If crash happens, WAL recovers the data
```

### Layer 3: Main Data Files
```
Data is written to persistent disk storage
→ Even if power goes out, data survives
→ On restart, database reads from disk
```

### Layer 4: ACID Transactions
```
A: Atomicity - All or nothing
C: Consistency - Valid state always
I: Isolation - No conflicts between users
D: Durability - Data persists after commit
```

---

## Conclusion

### What You Should Know ✅

1. **Your data is SAFE on restart/shutdown** - PostgreSQL persists to disk
2. **ON DELETE CASCADE is for data integrity** - Only deletes when you intentionally DELETE
3. **System events don't trigger cascades** - Only explicit DELETE commands trigger it
4. **Your itineraries won't spontaneously disappear** - They're permanently stored

### What Happens During System Restart

```
BEFORE RESTART          DURING RESTART         AFTER RESTART
───────────────        ──────────────         ──────────────
Data in database       Database disk files    Same data in database
User connection        Connection closes      New connection
Application running    App stops              App starts
                       Network unavailable    Network available


DATA IN DATABASE: UNCHANGED ✅
```

### Safe to Use! ✅

You can confidently:
- Restart servers
- Restart databases  
- Perform deployments
- Upgrade systems

Your data will be there when everything comes back up!


