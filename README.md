# Visitour - Cross-Platform Itinerary Application

A comprehensive travel itinerary planning application available on **Web**, **Android**, and **iOS** platforms.

## 📋 Features

### Core Functionality
- ✅ **User Authentication** - Register, login, and secure account management
- ✅ **Create Itineraries** - Plan trips with start and end dates
- ✅ **Organize by Days** - Structure activities day by day
- ✅ **Add Detailed Entries** - Each activity includes:
  - Title, description, location
  - Time (start/end)
  - Category (accommodation, activity, meal, transport, other)
  - Custom details for flexibility
- ✅ **Real-time Sync** - Changes sync across all devices
- ✅ **Cross-platform** - Web, iOS, and Android with consistent UX

### Phase 2 (Upcoming)
- Share itineraries with travel companions
- Push notifications for updates
- Export to PDF/CSV
- Maps integration
- Offline mode with sync

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js + TypeScript
- PostgreSQL for data
- Socket.io for real-time updates
- JWT for authentication

**Web Frontend:**
- React 18 + TypeScript
- Redux Toolkit for state management
- TailwindCSS for styling
- Vite for fast dev/builds

**Mobile (iOS & Android):**
- React Native with Expo
- Redux Toolkit (shared state logic)
- React Navigation
- AsyncStorage for local persistence

### Project Structure

```
visitour/
├── apps/
│   ├── api/              # Express backend
│   ├── web/              # React web app
│   └── mobile/           # React Native (Expo)
├── packages/
│   └── shared/           # Shared types and utilities
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn 3+
- PostgreSQL 12+
- (Optional) Docker for database

### Installation

1. **Clone and install dependencies:**
```bash
cd Visitour
yarn install
```

2. **Setup environment variables:**

```bash
# Backend (.env in apps/api)
cp apps/api/.env.example apps/api/.env
```

Edit `.env` with your settings:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://visitour:password@localhost:5432/visitour
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173,http://localhost:19000
```

3. **Setup Database:**

```bash
# Create database
createdb visitour

# Or use Docker
docker run --name visitour-postgres \
  -e POSTGRES_USER=visitour \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=visitour \
  -p 5432:5432 \
  -d postgres:15
```

### Development

Run all apps in development mode:

```bash
# Terminal 1 - Backend API
yarn dev:api

# Terminal 2 - Web App
yarn dev:web

# Terminal 3 - Mobile App
yarn dev:mobile
```

**Access:**
- Web: http://localhost:5173
- API: http://localhost:3000
- Mobile: Expo Go on your phone (scan QR code)

### Building

**Web:**
```bash
yarn build:web
# Output: apps/web/dist/
```

**Mobile:**
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

**API:**
```bash
yarn build:api
```

## 📡 API Documentation

### Authentication

**Register**
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login**
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Itineraries

**List User's Itineraries**
```
GET /api/itineraries
Headers: Authorization: Bearer <token>
```

**Create Itinerary**
```
POST /api/itineraries
Headers: Authorization: Bearer <token>
{
  "title": "Paris Trip",
  "description": "Summer vacation",
  "startDate": "2024-06-01",
  "endDate": "2024-06-10",
  "isPublic": false
}
```

**Get Itinerary**
```
GET /api/itineraries/{id}
```

**Update Itinerary**
```
PUT /api/itineraries/{id}
{
  "title": "Updated title",
  ...
}
```

**Delete Itinerary**
```
DELETE /api/itineraries/{id}
```

### Entries

**Get All Entries for Itinerary**
```
GET /api/entries/itinerary/{itineraryId}
```

**Create Entry**
```
POST /api/entries/itinerary/{itineraryId}
{
  "dayNumber": 1,
  "date": "2024-06-01",
  "title": "Arrive in Paris",
  "location": "Charles de Gaulle Airport",
  "timeStart": "14:00",
  "timeEnd": "15:30",
  "category": "transport",
  "description": "Flight arrives at 2 PM"
}
```

**Update Entry**
```
PUT /api/entries/{id}
{
  "title": "Updated title",
  ...
}
```

**Delete Entry**
```
DELETE /api/entries/{id}
```

## 🗄️ Database Schema

### users
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `profile_image_url` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### itineraries
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `title` (VARCHAR)
- `description` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `is_public` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### itinerary_entries
- `id` (UUID, PK)
- `itinerary_id` (UUID, FK → itineraries)
- `day_number` (INTEGER)
- `date` (DATE)
- `title` (VARCHAR)
- `description` (TEXT)
- `location` (VARCHAR)
- `time_start` (TIME)
- `time_end` (TIME)
- `category` (VARCHAR)
- `custom_details` (JSONB)
- `order_index` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT authentication with 7-day expiry
- CORS enabled for trusted origins
- SQL injection prevention via parameterized queries
- Input validation with Zod

## 📱 Mobile Deployment

### iOS
1. Get Apple Developer account
2. Configure provisioning profiles
3. Run: `eas build --platform ios --distribution appstore`
4. Submit to App Store

### Android
1. Create Google Play account
2. Generate signing key
3. Run: `eas build --platform android --distribution playstore`
4. Submit to Play Store

## 🛠️ Development

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety

### Format Code
```bash
yarn format
```

### Run Linting
```bash
yarn lint
```

### Type Check
```bash
yarn type-check
```

## 📚 Project Resources

- **API Documentation**: `docs/API_DOCS.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **Architecture Guide**: `docs/ARCHITECTURE.md`

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🆘 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce

---

**Happy Planning! 🌍✈️**

# Visitour
