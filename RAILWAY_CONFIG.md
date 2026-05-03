# Railway Deployment Configuration Guide

## What You Need to Know

### Architecture
Your Visitour app has 3 services:
1. **Backend API** (Node.js + Express) - `apps/api/`
2. **Web App** (React + Vite) - `apps/web/`
3. **Mobile App** (React Native) - `apps/mobile/` (optional for now)

Railway will only host #1 and #2 (Backend API and Web App).

### Technology Stack
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL
- **Frontend**: React 18 with Vite
- **Real-time**: Socket.io
- **Package Manager**: Yarn/NPM

---

## Free Tier Details

### What You Get
- **$5/month credit** (auto-refreshing)
- **24/7 uptime** with auto-restarts
- **PostgreSQL database** (included in credit)
- **SSL/HTTPS** (automatic)
- **Auto-scaling** (within resource limits)
- **Unlimited deployments** (push to GitHub = auto-deploy)

### What It Costs (Approximate)
- API service: $7-10/month (you get $5 free)
- Web service: $2-3/month (usually free)
- PostgreSQL: $10-15/month (you get $5 free)
- **Total monthly cost after free tier: $7-13** (can optimize)

### Optimize for Free Tier
1. Use Railway's shared PostgreSQL plans
2. Keep API lean (minimal dependencies)
3. Compress static web assets
4. Use Railway's automatic scaling

---

## Environment Variables Needed

### Backend API (`apps/api/`)

```env
# Core
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/visitour

# JWT
JWT_SECRET=your-random-64-character-hex-string-here

# CORS
CORS_ORIGIN=https://your-web-domain.railway.app
```

### Web App (`apps/web/`)

```env
# These should be prefixed with VITE_ for Vite
VITE_API_URL=https://your-api-domain.railway.app
VITE_API_SOCKET_URL=https://your-api-domain.railway.app
```

---

## Build & Start Commands

### API Service
```
Build Command: npm install
Start Command: npm run start
```

### Web Service
```
Build Command: npm run build
Start Command: npm run preview
```

---

## Railway Project Structure

```
Visitour (root)
├── apps/
│   ├── api/          ← Deploy as service #1
│   │   ├── package.json
│   │   └── src/
│   │       └── server.js (entry point)
│   │
│   └── web/          ← Deploy as service #2
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           └── main.tsx (entry point)
│
└── packages/
    └── shared/       ← Used by both (shared types)
```

---

## Deployment Flow

1. **Push to GitHub** → Automatic webhook
2. **Railway detects changes** → Starts build
3. **Build runs** → `npm install && npm run build`
4. **Deploy** → Starts `npm run start`
5. **Live!** → App accessible at your domain

---

## Important Files for Railway

Make sure these exist in your repo:

✅ `/apps/api/package.json` - Defines dependencies & scripts
✅ `/apps/api/src/server.js` or `.ts` - Entry point
✅ `/apps/web/package.json` - Web dependencies & scripts
✅ `/apps/web/vite.config.ts` - Vite configuration
✅ `/apps/web/index.html` - HTML entry point

---

## Quick Reference: Step-by-Step

### 1. GitHub Setup (5 min)
```bash
git add .
git commit -m "Ready for Railway"
git push origin main
```

### 2. Railway Setup (10 min)
- Sign up at https://railway.app
- Create new project
- Connect GitHub repo
- Auto-detects monorepo structure

### 3. Add Services (15 min)
- Add PostgreSQL service
- Add API service (root: apps/api)
- Add Web service (root: apps/web)

### 4. Configure (10 min)
- Set environment variables
- Set build/start commands
- Configure root directories

### 5. Deploy (5 min)
- Click "Deploy" or auto-deploy on push
- Check logs for errors
- Test app!

---

## Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| **Deployment fails** | Check logs tab → see exact error |
| **App won't start** | Verify `PORT=3000` env var set |
| **Can't connect to DB** | Check `DATABASE_URL` matches PostgreSQL service |
| **Web can't reach API** | Verify `VITE_API_URL` is correct API domain |
| **WebSocket not working** | Ensure `CORS_ORIGIN` includes web domain |
| **Running out of credit** | Scale down resources or add payment |

---

## Useful Railway CLI Commands

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Pull environment variables locally
railway variable

# Run command with Railway env
railway run npm run dev

# Deploy latest
railway deploy
```

---

## After First Successful Deployment

1. **Add custom domain** (optional)
   - Settings → Custom Domain
   - Point DNS to Railway

2. **Enable backups**
   - PostgreSQL service → Settings
   - Enable automated backups

3. **Monitor performance**
   - Dashboard shows CPU, memory, network
   - Set up billing alerts

4. **Access deployed app**
   - Web: `https://your-web-domain.railway.app`
   - API: `https://your-api-domain.railway.app/api/health`

---

## Success Indicators

You'll know it works when:

✅ API responds to `/api/health`
✅ Web app loads without errors
✅ Can register & login
✅ Can create itineraries
✅ WebSocket works (real-time updates)
✅ Mobile (optional) can connect to API

---

**Ready? Follow RAILWAY_DEPLOYMENT.md for the full guide!**

