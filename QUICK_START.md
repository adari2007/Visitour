# Quick Start Guide

Get Visitour running locally in 5 minutes!

## 1. Install Dependencies

```bash
# From project root
yarn install
```

## 2. Start Database (using Docker)

```bash
# Start PostgreSQL + pgAdmin
docker-compose up -d

# Verify connection
docker-compose ps
```

**pgAdmin Access:** http://localhost:5050
- Email: admin@visitour.local
- Password: admin

## 3. Setup Backend

```bash
# Copy env file
cp apps/api/.env.example apps/api/.env

# Start backend
yarn dev:api
```

You should see:
```
✓ Connected to PostgreSQL
✓ Database migrations completed
✓ Server running on http://localhost:3000
✓ WebSocket available at ws://localhost:3000
```

## 4. Setup Web App

```bash
# In another terminal
yarn dev:web
```

Open: http://localhost:5173

## 5. Setup Mobile App (Optional)

```bash
# In another terminal
yarn dev:mobile
```

Scan the QR code with Expo Go app on your phone.

## Testing the App

1. **Register a new account**
   - Email: user@example.com
   - Password: password123

2. **Create an itinerary**
   - Click "New Itinerary"
   - Fill in trip details (dates, title, description)
   - Click "Create Itinerary"

3. **Add entries to itinerary**
   - Click on the itinerary
   - Click "Add Entry"
   - Fill in activity details (title, time, location, category)
   - Click "Add Entry"

4. **Edit/Delete entries**
   - Click "Edit" to modify
   - Click "Delete" to remove

## Debugging

### Backend
```bash
# Check logs
tail -f /tmp/visitour-api.log

# View database
docker exec -it visitour-postgres psql -U visitour -d visitour
```

### View All Itineraries
```sql
SELECT * FROM itineraries;
SELECT * FROM itinerary_entries;
```

### Reset Database
```bash
# Drop and recreate
docker exec visitour-postgres dropdb -U visitour visitour
docker exec visitour-postgres createdb -U visitour visitour

# Restart API to run migrations
yarn dev:api
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker-compose restart postgres
```

### Migrations Failed
- Check DATABASE_URL is correct in .env
- Ensure PostgreSQL is running
- Check database exists: `psql -l | grep visitour`

## Environment Variables Explained

```env
PORT=3000                                    # API port
NODE_ENV=development                         # Environment
DATABASE_URL=postgresql://...               # Database connection
JWT_SECRET=your-secret-key                  # JWT signing key
JWT_EXPIRY=7d                               # Token expiry
CORS_ORIGIN=http://localhost:5173,...       # Allowed origins
WS_URL=http://localhost:3000                # WebSocket URL
```

## Next Steps

1. Explore the codebase:
   - `apps/api/src/routes/` - API endpoints
   - `apps/web/src/pages/` - Web pages
   - `apps/web/src/store/` - Redux state management
   - `packages/shared/src/types/` - Shared types

2. Read the full README: `README.md`

3. Check API docs: `docs/API_DOCS.md`

4. Deploy to production (see deployment guide)

## Support

For issues, check the main README or create a GitHub issue.

Happy coding! 🚀

