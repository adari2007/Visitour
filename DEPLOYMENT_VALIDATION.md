# Pre-Deployment Validation Checklist

Before deploying to Railway, run through this comprehensive checklist to ensure everything is configured correctly.

---

## 📋 Level 1: GitHub Repository Setup

- [ ] Repository is on GitHub (public or private)
- [ ] All code is committed: `git status` shows clean working tree
- [ ] Latest changes are pushed: `git push`
- [ ] Remote is configured: `git remote -v` shows origin
- [ ] Branch is set to main/master: `git branch`
- [ ] `.gitignore` includes:
  - [ ] `node_modules/`
  - [ ] `.env` (local environment files)
  - [ ] `.env.local`
  - [ ] `dist/`
  - [ ] `build/`
  - [ ] Database files (if using SQLite)

---

## 📋 Level 2: Project Structure Verification

- [ ] Root `package.json` exists
- [ ] `apps/api/` folder exists with:
  - [ ] `package.json` with correct name `@visitour/api`
  - [ ] `tsconfig.json`
  - [ ] `src/server.ts` or `src/server.js`
  - [ ] All source files in `src/` directory
- [ ] `apps/web/` folder exists with:
  - [ ] `package.json` with correct name `@visitour/web`
  - [ ] `tsconfig.json`
  - [ ] `vite.config.ts`
  - [ ] `index.html`
  - [ ] `src/main.tsx` or `src/main.jsx`
- [ ] `packages/shared/` folder exists (if using shared types)

---

## 📋 Level 3: Dependencies Verification

### API Service (`apps/api/`)

Run: `cd apps/api && npm install && npm run dev`

- [ ] Installation completes without errors
- [ ] Server starts successfully
- [ ] Console shows: `✓ Server running on http://localhost:3000`
- [ ] Health check works: `curl http://localhost:3000/api/health`
- [ ] Database connection works
- [ ] Key dependencies present:
  - [ ] express
  - [ ] pg (PostgreSQL)
  - [ ] socket.io
  - [ ] bcryptjs
  - [ ] jsonwebtoken
  - [ ] cors
  - [ ] dotenv

### Web Service (`apps/web/`)

Run: `cd apps/web && npm install && npm run dev`

- [ ] Installation completes without errors
- [ ] Dev server starts successfully
- [ ] Console shows: `Local: http://localhost:5173`
- [ ] Browser opens to homepage
- [ ] App loads without console errors
- [ ] Key dependencies present:
  - [ ] react
  - [ ] react-router-dom
  - [ ] @reduxjs/toolkit
  - [ ] react-redux
  - [ ] axios
  - [ ] socket.io-client
  - [ ] tailwindcss
  - [ ] vite

---

## 📋 Level 4: Environment Variables

### API Service (.env needed)

Create `apps/api/.env.local` with:
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost/visitour
JWT_SECRET=development-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

- [ ] All required variables present
- [ ] DATABASE_URL is valid connection string
- [ ] JWT_SECRET is set (change for production!)
- [ ] CORS_ORIGIN matches web frontend

### Web Service (.env needed - optional for local)

Create `apps/web/.env.local` with:
```
VITE_API_URL=http://localhost:3000
VITE_API_SOCKET_URL=http://localhost:3000
```

- [ ] VITE_API_URL points to API service
- [ ] VITE_API_SOCKET_URL is configured

---

## 📋 Level 5: Local Testing

### 5.1 Backend API Tests

- [ ] API starts: `npm run dev` from `apps/api/`
- [ ] Health endpoint works: `curl localhost:3000/api/health`
- [ ] Returns JSON: `{"status":"ok","timestamp":"..."}`
- [ ] Auth routes exist: `POST /api/auth/register`
- [ ] Database migrations run automatically
- [ ] No console errors during startup

### 5.2 Frontend Tests

- [ ] Web app starts: `npm run dev` from `apps/web/`
- [ ] Loads at `http://localhost:5173`
- [ ] No 404 errors for static assets
- [ ] No console errors
- [ ] Can navigate to different pages
- [ ] API client initialized (check Network tab)

### 5.3 Integration Tests

With both services running:

- [ ] Can register new account
  - [ ] Fill registration form
  - [ ] Submit
  - [ ] Account created (check API logs)
  - [ ] Redirected to login or dashboard
- [ ] Can login with created account
  - [ ] JWT token received
  - [ ] Token stored (check localStorage)
  - [ ] Dashboard loads
- [ ] Can create itinerary
  - [ ] Form appears
  - [ ] Can enter title, dates
  - [ ] Submit successful
  - [ ] Appears in dashboard
- [ ] Can add entries
  - [ ] Entry form appears
  - [ ] Can select day, enter details
  - [ ] Submit successful
  - [ ] Appears in itinerary
- [ ] Real-time updates work
  - [ ] Open 2 browser windows both logged in
  - [ ] Edit entry in one window
  - [ ] Changes appear instantly in other window

---

## 📋 Level 6: Build Verification

### API Build

```bash
cd apps/api
npm run build
```

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Output directory created
- [ ] Can start from built output: `npm start`

### Web Build

```bash
cd apps/web
npm run build
```

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Output directory created (dist/)
- [ ] `dist/index.html` exists
- [ ] Can preview: `npm run preview`

---

## 📋 Level 7: Production Configuration

### API Production Config

- [ ] Hardcoded `localhost` replaced with environment variables
- [ ] PORT reads from env: `process.env.PORT`
- [ ] DATABASE_URL read from env
- [ ] CORS_ORIGIN read from env
- [ ] JWT_SECRET read from env
- [ ] Error messages don't expose sensitive info
- [ ] Logging appropriate for production (no `console.log` spam)

### Web Production Config

- [ ] API URLs use environment variables (VITE_)
- [ ] No hardcoded `localhost` URLs
- [ ] API calls use dynamic URLs
- [ ] Build output is optimized (check dist/ size)
- [ ] Source maps not included in production build

---

## 📋 Level 8: Railway Specific

- [ ] `package.json` name is `@visitour/api` for API
- [ ] `package.json` name is `@visitour/web` for Web
- [ ] Both have `node` type: `"type": "module"`
- [ ] Start command works locally: `npm run start`
- [ ] Build command works locally: `npm run build`
- [ ] No hard dependencies on Docker (SQLite for development is OK)
- [ ] No services running on ports other than 3000 (API) and 5173 (Web locally)
- [ ] `.railway.json` exists in root (optional)

---

## 📋 Level 9: Database

### Development Database

- [ ] Running locally (SQLite auto-created)
- [ ] Database file exists: `apps/api/data/store.json` or similar
- [ ] Migrations run automatically on startup
- [ ] Tables created: users, itineraries, itinerary_entries
- [ ] No errors in migration logs

### Production Database (Railway PostgreSQL)

- [ ] PostgreSQL service will be created in Railway
- [ ] Connection string format: `postgresql://user:pass@host:port/db`
- [ ] All special characters in password properly escaped
- [ ] Database exists and is accessible
- [ ] Connection pool configured appropriately

---

## 📋 Level 10: Security

- [ ] JWT_SECRET is randomly generated (64+ chars)
- [ ] PASSWORD: Stored as bcrypt hash (not plaintext)
- [ ] CORS: Only allows specific origins (not `*` in production)
- [ ] API: Validates all input (Zod schemas)
- [ ] Secrets: Not hardcoded in source code
- [ ] HTTPS: Ready (Railway provides this)
- [ ] No console.log of sensitive data
- [ ] No credentials in git history

---

## 📋 Level 11: Error Handling

- [ ] API returns proper HTTP status codes
  - [ ] 200 for success
  - [ ] 201 for created
  - [ ] 400 for bad request
  - [ ] 401 for unauthorized
  - [ ] 404 for not found
  - [ ] 500 for server error
- [ ] Web app handles API errors gracefully
- [ ] Error messages are user-friendly
- [ ] No stack traces shown to users

---

## 📋 Level 12: Logging

- [ ] Startup logs show version and status
- [ ] API logs show incoming requests (or debug level)
- [ ] Database connection logged
- [ ] Errors logged with context
- [ ] WebSocket connections logged
- [ ] Can be disabled via environment variable

---

## 🚀 Pre-Deployment Checklist

Before clicking "Deploy" on Railway:

- [ ] All Level 1-12 items checked
- [ ] Recent push to main branch
- [ ] No console errors when running locally
- [ ] API responds to health check
- [ ] Web app loads without errors
- [ ] Can complete full flow (register → login → create itinerary)
- [ ] Real-time features work (WebSocket)
- [ ] No sensitive data in `.env` files
- [ ] `.gitignore` includes `.env*` files
- [ ] All team members have latest code

---

## 🎯 Deployment Day Checklist

### Before Deploying to Railway

- [ ] GitHub repo is up to date
- [ ] All code is committed and pushed
- [ ] Create new strong JWT_SECRET (save it)
- [ ] Have generated Railway domains ready
- [ ] Environment variables prepared
- [ ] Database credentials ready (PostgreSQL service)

### After Deploying to Railway

- [ ] API service health check passes
- [ ] Web app loads in browser
- [ ] Can see actual Railway domains
- [ ] Update environment variables with real domains
- [ ] Web app environment updated with correct API URL
- [ ] All services restarted/redeployed
- [ ] Test full flow in production
- [ ] Monitor logs for errors

---

## 🛠️ Quick Validation Commands

Run these to validate your setup:

```bash
# Check Node version (should be 14+, preferably 18+)
node --version

# Check npm version
npm --version

# Check Git status
git status

# Run API locally
cd apps/api && npm install && npm run dev
# Test: curl localhost:3000/api/health

# Run Web locally (in new terminal)
cd apps/web && npm install && npm run dev
# Open: http://localhost:5173

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for hardcoded localhost
grep -r "localhost:3000" apps/web/src/
grep -r "127.0.0.1" apps/
```

---

## 📞 If Something Fails

1. **Check the error message** - It usually tells you what's wrong
2. **Look at logs** - `npm run dev` will show startup issues
3. **Review this checklist** - Step-by-step verification
4. **Check documentation:**
   - `RAILWAY_DEPLOYMENT.md` - Full deployment guide
   - `RAILWAY_QUICK_START.md` - Quick reference
   - `RAILWAY_CONFIG.md` - Configuration details
5. **Ask for help** - Drop an issue in GitHub or check Railway docs

---

## ✅ You're Ready When...

- [ ] All items in Level 1-12 are checked
- [ ] App runs perfectly locally
- [ ] All tests pass
- [ ] No errors in console
- [ ] Database works locally
- [ ] Real-time features working
- [ ] Security best practices followed

---

## 🎉 Success!

If all checkboxes are checked, your app is ready for Railway!

**You're about to deploy a production-ready app. Exciting! 🚀**

---

**Last Updated:** May 2, 2026
**Version:** 1.0.0
**Status:** Ready for Deployment

