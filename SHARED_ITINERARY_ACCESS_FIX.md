# Shared Itinerary Access Control Fix

## Problem
Users with **view-only access** to a shared itinerary could still see and access the edit/delete buttons for itineraries and entries, as well as buttons to add transport, hotel, and activities. This should not be possible - only users with **edit access** or the itinerary **owner** should have these capabilities.

Additionally, non-owners could see the full "Share & Export" options panel, which should only be available to the owner.

## Solution
The fix implements proper access control for shared itineraries by checking the user's share access level in addition to ownership status, and hiding UI elements appropriately based on access level.

### Changes Made

#### 1. **ItineraryDetailPage.tsx** (lines 96-109)
Added logic to determine if the current user has view-only access to a shared itinerary:

```typescript
// Check if user has view-only (not edit) access to a shared itinerary
const userShareAccess = shares.length > 0 
  ? shares.find((s: any) => s.email === user?.email)?.access 
  : undefined;
const hasViewOnlyAccess = Boolean(!isOwner && userShareAccess === 'view');

const canManageEntries = !isReadOnlyPublicView && !hasViewOnlyAccess;
const canEditTrip = !isReadOnlyPublicView && !hasViewOnlyAccess;
const canManageShares = !isReadOnlyPublicView; // Only owner can manage shares
```

**What it does:**
- Finds the current user's share record by comparing their email with share emails
- Determines if they have "view" access (as opposed to "edit" or no share)
- Sets `hasViewOnlyAccess` to true if user is NOT the owner AND has "view" access
- Blocks entry management, trip editing, and share management when user has view-only access

#### 2. **ItineraryDetailPage.tsx** (lines 193-197)
Modified the `fetchShares` effect to always fetch shares:

```typescript
useEffect(() => {
  if (!token || !id || !itinerary) return;
  // Always fetch shares to check user's access level for shared itineraries
  dispatch(fetchShares(id));
}, [dispatch, id, token, itinerary]);
```

**What it does:**
- Previously only fetched shares if `canManageShares` was true (owner only)
- Now always fetches shares so we can check the current user's access level
- Allows the component to determine access control properly before rendering

#### 3. **ItineraryDetailPage.tsx** (lines 797-906) - Share & Export Panel
Updated the Share & Export section to conditionally render based on ownership and share access:

**For Owners:**
- Full "Share & Export" panel with:
  - Copy Public URL (if public)
  - Copy Formatted Text
  - Export PDF
  - Share management (grant/revoke access)

**For Users with View-Only Share Access (Public Itinerary Only):**
- Minimal "Share" panel with only:
  - Copy Public URL button

**For Public Viewers (Read-Only Public Itinerary):**
- Minimal "Share" panel with only:
  - Copy Public URL button

**For Private Itineraries (Non-Owner):**
- Share & Export section is completely hidden

**What it does:**
- Hides the entire Share & Export panel from non-owners
- Shows only the public URL button for:
  - Users with view-only share access viewing a public itinerary
  - Public viewers of a public itinerary
- Prevents non-owners from seeing or accessing share management features

#### 4. **EntriesList.tsx** - Multiple functions
Updated all functions that allow entry creation/editing to show informative alerts when the user lacks permission:

- `openComposer()` - Alerts user when trying to add entries
- `openComposerForEdit()` - Alerts user when trying to edit entries
- `handleAddEntryFromHeader()` - Alerts user when trying to add entries via header button
- `handleAddEntryTypeFromHeader()` - Alerts user when trying to add specific entry types

**What it does:**
- Prevents silent failures (early returns)
- Provides clear feedback to users about why they can't perform certain actions
- Message: "You do not have permission to [action] to this itinerary. Only users with edit access can [action]."

### Access Control Matrix

| User Type | Is Owner | Has View Share | Has Edit Share | Can Edit Trip | Can Add/Edit Entries | Can Manage Shares | See Full Share & Export | Can Copy Public URL |
|-----------|----------|---|---|---|---|---|---|---|
| Owner | ✓ | - | - | ✓ | ✓ | ✓ | ✓ | ✓ (if public) |
| Edit Share | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ (if public) |
| View Share | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (if public) |
| Public Viewer | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (if public) |

### Testing Checklist

- [ ] Owner can edit their own itinerary
- [ ] Owner can add/edit/delete entries in their itinerary
- [ ] Owner can manage shares (grant/revoke access)
- [ ] Owner sees full Share & Export panel with all options
- [ ] User with edit share can edit itinerary and entries
- [ ] User with edit share CANNOT manage shares
- [ ] User with edit share does NOT see Share & Export panel
- [ ] User with view share sees read-only UI
- [ ] User with view share gets alert when trying to edit
- [ ] User with view share CANNOT add/edit/delete entries
- [ ] User with view share does NOT see Share & Export panel (if itinerary is private)
- [ ] User with view share CAN see "Copy Public URL" button (if itinerary is public)
- [ ] User viewing public itinerary (not owner) only sees Copy Public URL button
- [ ] User viewing private itinerary (not owner) does NOT see Share & Export panel
- [ ] Buttons are hidden appropriately based on access level

### Notes

- Share information is now fetched on every itinerary load to check user access
- The system uses email matching to identify the current user's share record
- View-only access is treated the same as public read-only access in terms of permissions
- Users receive clear feedback when trying to perform unauthorized actions
- The Share & Export panel is now owner-only with special handling for public URLs


