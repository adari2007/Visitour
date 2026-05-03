# Entry Deletion - Test Checklist

## Overview
After the deletion fix, test these scenarios to ensure entries are properly deleted and all related entries are handled correctly.

## Test Environment Setup
1. Start the application
2. Create a test trip with multiple days
3. Add various entry types
4. Monitor browser console for debug logs (F12 → Console tab)

---

## Basic Delete Tests

### 1. Delete a Simple Activity Entry
- [ ] Create an activity entry on Day 1
- [ ] Click Delete button on the activity
- [ ] Confirm deletion when prompted
- [ ] Verify:
  - Activity is removed from the list
  - No error appears
  - Console shows: "handleDeleteEntry called with: ...", "Other entry type - single delete", "Dispatching deleteEntry for: ...", "Entry deleted successfully"
  - Entry count decreases

### 2. Delete a Meal Entry
- [ ] Create a meal entry on Day 2
- [ ] Click Delete button on the meal
- [ ] Confirm deletion when prompted
- [ ] Verify:
  - Meal is removed from the list
  - No error appears
  - Entry count decreases

---

## Transport Entry Delete Tests

### 3. Delete a Simple One-Way Flight
- [ ] Create a one-way flight (outbound only)
- [ ] Click Delete button
- [ ] Verify confirmation shows: "Delete this outbound flight and all 1 related entries?"
- [ ] Confirm deletion
- [ ] Verify:
  - Flight is removed
  - Console shows: "Transport entries to delete: [entry_id]"
  - Confirmation said "1 related entries"

### 4. Delete a Round-Trip Flight
- [ ] Create a round-trip flight with return date different from outbound
- [ ] This should create 2 entries (outbound and return)
- [ ] Click Delete on the outbound flight
- [ ] Verify confirmation shows: "Delete this outbound flight and all 2 related entries?"
- [ ] Confirm deletion
- [ ] Verify:
  - Both outbound and return flights are deleted
  - Console shows both entry IDs in "Transport entries to delete"
  - Both entries removed from UI

### 5. Delete a Round-Trip Flight with "Show on All Days"
- [ ] Create a round-trip flight from Day 2 to Day 5 with "Show on all days" enabled
- [ ] This should create 4 entries (outbound, transit day 3, transit day 4, return)
- [ ] Click Delete on any of the entries
- [ ] Verify confirmation shows: "Delete this flight and all 4 related entries?"
- [ ] Confirm deletion
- [ ] Verify:
  - All 4 entries are deleted (outbound, both transit days, return)
  - Console shows all 4 entry IDs in "Transport entries to delete"
  - All entries removed from UI

### 6. Delete a Bus/Train/Custom Transport
- [ ] Create a custom transport type (not flight)
- [ ] Click Delete
- [ ] Verify:
  - Entry is deleted
  - Works same as flight deletion

---

## Hotel Entry Delete Tests

### 7. Delete a Single-Day Hotel Stay
- [ ] Create a hotel stay with check-in and check-out on the same day (Day 3)
- [ ] Click Delete on the hotel entry
- [ ] Verify confirmation shows: "Delete this hotel stay and all 1 related day entries?"
- [ ] Confirm deletion
- [ ] Verify:
  - Hotel entry is deleted
  - Console shows: "Hotel entries to delete: [entry_id]"

### 8. Delete a Multi-Day Hotel Stay
- [ ] Create a hotel stay from Day 3 to Day 6 (4 days)
- [ ] This should create 4 entries (check-in day, middle days, check-out day)
- [ ] Click Delete on any hotel entry
- [ ] Verify confirmation shows: "Delete this hotel stay and all 4 related day entries?"
- [ ] Confirm deletion
- [ ] Verify:
  - All 4 hotel entries are deleted
  - Console shows all 4 entry IDs
  - All entries removed from UI

### 9. Delete Hotel Stay and Verify Other Entries Unaffected
- [ ] Create multiple hotel stays
- [ ] Create other entry types on the same days
- [ ] Delete one hotel stay
- [ ] Verify:
  - Only the hotel entries for that stay are deleted
  - Other entry types (activities, transport) on the same days remain
  - Other hotel stays remain

---

## Error Handling Tests

### 10. Test Delete Error Alert
- [ ] Disconnect internet or disable network (use DevTools)
- [ ] Try to delete an entry
- [ ] Verify:
  - After clicking confirm, an error alert appears
  - Alert text matches error type (404 for not found, 401 for unauthorized, 500 for server error)
  - Entry is NOT removed from the list
  - Redux loading state is properly set to false

### 11. Test Cancellation
- [ ] Click Delete on any entry
- [ ] Click "No" or cancel in the confirmation dialog
- [ ] Verify:
  - Entry is NOT deleted
  - Entry remains in the list
  - No API requests were sent (check Network tab)

---

## Console Log Verification

For each delete operation, check browser console (F12 → Console) for these logs in order:

### Simple Entry:
```
handleDeleteEntry called with: {id: "...", date: "...", ...}
Entry details: {}
Other entry type - single delete
Dispatching deleteEntry for: [entry_id]
Entry deleted successfully
```

### Hotel Entry:
```
handleDeleteEntry called with: {id: "...", date: "...", ...}
Entry details: {type: "hotel", hotelName: "...", ...}
Hotel entries to delete: [id1, id2, id3, ...]
Hotel entries deleted successfully
```

### Transport Entry:
```
handleDeleteEntry called with: {id: "...", date: "...", ...}
Entry details: {type: "flight", leg: "outbound", ...}
Transport entries to delete: [id1, id2, ...]
Transport entries deleted successfully
```

---

## Redux State Verification

Monitor Redux state (use Redux DevTools if available):

### Before Delete:
- `loading: false`
- `error: null`
- `entries: [ { id: "entry-to-delete", ...}, ... ]`

### During Delete (transient):
- `loading: true`
- `error: null`
- `entries: [ unchanged initial list ]`

### After Successful Delete:
- `loading: false`
- `error: null`
- `entries: [ list without deleted entries ]`

### After Failed Delete:
- `loading: false`
- `error: "Error message describing the problem"`
- `entries: [ unchanged - entry still there ]`

---

## Edge Cases

### 12. Delete Last Entry on a Day
- [ ] Create one activity on Day 5
- [ ] Delete it
- [ ] Verify:
  - Day 5 still shows "No entries yet" message
  - Day can still be expanded to add new entries

### 13. Delete Entry While Another is Loading
- [ ] Attempt to delete an entry (let it be in-flight)
- [ ] Immediately click Delete on another entry
- [ ] Verify:
  - Second delete waits for first to complete
  - Both eventually either succeed or fail appropriately

### 14. Delete After Filtering/Searching
- [ ] If app has search/filter, apply a filter
- [ ] Delete a visible entry
- [ ] Remove filter
- [ ] Verify:
  - Entry is gone from all views
  - Entry count is accurate

---

## Cross-Device Testing

### 15. Test on Mobile Web
- [ ] Access app on mobile browser
- [ ] Delete transport entry with multiple related entries
- [ ] Verify:
  - Confirmation dialog displays properly
  - All entries are deleted
  - UI updates correctly on mobile

---

## Performance Tests

### 16. Delete Multiple Consecutive Entries
- [ ] Delete 5 entries in rapid succession
- [ ] Verify:
  - All are deleted successfully
  - No "race condition" issues
  - UI updates for each deletion

### 17. Bulk Delete (optional - if implemented)
- [ ] If app supports selecting multiple entries
- [ ] Select 3-5 entries
- [ ] Delete all at once
- [ ] Verify all are deleted together

---

## Success Criteria

All tests should result in:
- ✅ Entries are immediately removed from UI
- ✅ Related entries are deleted together (transport legs, hotel days)
- ✅ Confirmation dialogs show correct counts
- ✅ Error alerts appear for failures
- ✅ Console shows debug logs in correct order
- ✅ Redux state updates properly
- ✅ No ghost entries remain after page reload
- ✅ No unrelated entries are accidentally deleted

---

## Notes
- Tests should be performed in both web and mobile apps
- Clear browser cache between major test groups to avoid stale state
- Use Redux DevTools extension for better state visibility
- Check Network tab in DevTools to verify API calls are sent
- Report any discrepancies between expected and actual behavior

