# Architecture Overview

## System Design

Visitour uses a **monorepo architecture** with three main applications sharing a common backend and state management patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                    Visitour Monorepo                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  iOS App     │  │ Android App  │      │
│  │  (React)     │  │(React Native)│  │(React Native)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│                    HTTP + WebSocket                         │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐       │
│  │         Express.js API (Node.js)                │       │
│  ├─────────────────────────────────────────────────┤       │
│  │ • Authentication (JWT)                          │       │
│  │ • Itinerary CRUD                               │       │
│  │ • Entry Management                             │       │
│  │ • Real-time Sync (Socket.io)                   │       │
│  └────────────────────┬────────────────────────────┘       │
│                       │                                     │
│  ┌────────────────────▼────────────────────────────┐       │
│  │    PostgreSQL Database                          │       │
│  ├─────────────────────────────────────────────────┤       │
│  │ • users                                         │       │
│  │ • itineraries                                  │       │
│  │ • itinerary_entries                            │       │
│  │ • shared_itineraries (future)                  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Rationale

### Backend: Node.js + Express
- **Why**: JavaScript across all layers, fast development
- **Scalability**: Built-in clustering support
- **Ecosystem**: Huge NPM package ecosystem
- **Real-time**: Socket.io for instant updates

### Database: PostgreSQL
- **Why**: ACID compliance, complex queries, JSON support
- **JSONB**: For flexible custom_details field
- **Indexing**: Performance optimization
- **Migrations**: Version control for schema

### Frontend Web: React
- **Why**: Most popular, large ecosystem, reusable components
- **Vite**: 10x faster than webpack
- **TailwindCSS**: Utility-first CSS, rapid UI development

### Mobile: React Native + Expo
- **Why**: 95% code sharing between iOS and Android
- **Expo**: No native build complexity, instant deployment
- **Redux**: Shared state patterns between web and mobile

## State Management

Both web and mobile use **Redux Toolkit**:

```
Action → Reducer → Store → Component
  ↑                           ↓
  └───────────────────────────┘
       Middleware (Redux Thunk)
```

### Store Structure
```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null
  },
  itineraries: {
    items: Itinerary[],
    selected: Itinerary | null,
    entries: Entry[],
    loading: boolean,
    error: string | null
  }
}
```

## API Communication

### REST Endpoints
- **Authentication**: `/api/auth/*`
- **Itineraries**: `/api/itineraries/*`
- **Entries**: `/api/entries/*`

### Real-time Updates (Socket.io)
- User joins itinerary room: `join-itinerary`
- Entry created: `entry-created`
- Entry updated: `entry-updated`
- Entry deleted: `entry-deleted`

## Authentication Flow

```
User Input (email/password)
         ↓
    API Request
         ↓
    Password Hashing (bcrypt)
         ↓
    JWT Token Generation
         ↓
    Store Token (localStorage/AsyncStorage)
         ↓
    Add to Authorization Header
```

## Data Flow (Creating Entry)

```
User fills form → validate → Redux action
         ↓
    API POST request
         ↓
    Server validates & stores
         ↓
    Socket.io broadcast to listeners
         ↓
    Redux updated with new entry
         ↓
    UI re-renders automatically
         ↓
    All connected clients see update
```

## Deployment Architecture

### Production Setup

```
         ┌─────────────────────┐
         │   User Browser      │
         └──────────┬──────────┘
                    │ HTTPS
    ┌───────────────▼────────────────┐
    │    CloudFront / CDN            │
    │    (Web assets cached)         │
    └───────────────┬────────────────┘
                    │
    ┌───────────────▼────────────────┐
    │    Application Load Balancer   │
    └───────────────┬────────────────┘
                    │
    ┌───────────────▼────────────────────────────┐
    │  Auto-scaling EC2 instances (Dockerized)   │
    │  ├─ Express.js API                         │
    │  └─ Socket.io Server                       │
    └───────────────┬────────────────────────────┘
                    │
    ┌───────────────▼────────────────┐
    │   RDS PostgreSQL               │
    │   (Multi-AZ deployment)        │
    └────────────────────────────────┘
```

### Mobile Deployment

**iOS**
- Compiled with Xcode
- Signed with developer certificate
- Submitted to App Store
- Auto-updates via Expo

**Android**
- Compiled for ARM architecture
- Signed with release key
- Published to Google Play Store
- Auto-updates via Expo

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Each instance can handle any request
- **Load Balancer**: Distributes traffic
- **Database**: Separate layer, easily scaled

### Caching
- **Redis** (future): Session cache, rate limiting
- **CDN**: Static assets
- **Browser**: LocalStorage for offline

### Database Optimization
- **Indexes**: On user_id, itinerary_id
- **Connection Pooling**: Max 20 connections
- **Query Optimization**: SELECT only needed fields

## Security Measures

1. **Authentication**
   - JWT with 7-day expiry
   - Refresh token strategy (future)

2. **Authorization**
   - Ownership verification
   - Row-level security

3. **Input Validation**
   - Zod schema validation
   - SQL injection prevention

4. **Password Security**
   - bcryptjs with 10 salt rounds
   - Never store plaintext

5. **CORS**
   - Whitelist allowed origins
   - Credentials handling

6. **HTTPS**
   - Required in production
   - SSL/TLS certificates

## Performance Optimization

1. **Frontend**
   - Code splitting with Vite
   - Lazy loading components
   - Memoization for render optimization

2. **Backend**
   - Connection pooling
   - Database indexing
   - Compression middleware

3. **Mobile**
   - Binary caching
   - Minimal re-renders
   - Async operations

## Monitoring & Logging

### Application Metrics
- Request/response times
- Error rates
- Active connections

### Database
- Query performance
- Connection pool usage
- Disk usage

### Infrastructure
- CPU usage
- Memory usage
- Network bandwidth

## Future Enhancements

### Phase 2
- Real-time collaboration
- Itinerary sharing
- Comments & notes

### Phase 3
- Maps integration
- Calendar view
- PDF export
- Notifications

### Phase 4
- Machine learning recommendations
- Social features
- Monetization (premium)

---

**Architecture Version**: 1.0
**Last Updated**: 2024-04-30

