# 🚂 Railway Deployment Checklist - Visual Guide

Print this out or keep it open while deploying!

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Step 1: GitHub
```
[ ] Code committed to main branch
[ ] Latest changes pushed to GitHub
[ ] README is up to date
[ ] .gitignore includes .env files
```

### Step 2: Local Testing
```
[ ] Backend runs: cd apps/api && npm run dev
[ ] Frontend runs: cd apps/web && npm run dev
[ ] Can register account
[ ] Can login
[ ] Can create itinerary
[ ] Can add entries
[ ] Real-time sync works
```

### Step 3: Prepare Credentials
```
[ ] Generate JWT secret:
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    
    JWT_SECRET: _____________________________________
    
[ ] Have Railway account ready
[ ] GitHub auth approved for Railway
```

---

## ✅ RAILWAY DEPLOYMENT CHECKLIST

### Stage 1: Project Setup (5 min)
```
[ ] Go to https://railway.app
[ ] Sign up/Login with GitHub
[ ] Create New Project
[ ] Select "Deploy from GitHub repo"
[ ] Choose "Visitour" repository
```

### Stage 2: Add Services (10 min)

#### Database Service
```
[ ] Click "+ Add Service"
[ ] Search "PostgreSQL"
[ ] Click "Deploy"
[ ] Wait for service to initialize
[ ] Go to "Connect" tab
[ ] Copy connection string and save:
    
    DATABASE_URL: _________________________________
    
[ ] Keep this tab open (you'll need it)
```

#### API Service
```
[ ] Click "+ Add Service"
[ ] Select "GitHub Repo"
[ ] Choose "Visitour"
[ ] Set Root Directory: apps/api
[ ] Wait for service to appear
[ ] Click on API service
```

#### Configure API Build
```
[ ] Go to "Settings"
[ ] Find "Build Command"
[ ] Set to: npm install
[ ] Find "Start Command"
[ ] Set to: npm run start
```

#### Web Service
```
[ ] Click "+ Add Service"
[ ] Select "GitHub Repo"
[ ] Choose "Visitour"
[ ] Set Root Directory: apps/web
[ ] Wait for service to appear
[ ] Click on Web service
```

#### Configure Web Build
```
[ ] Go to "Settings"
[ ] Find "Build Command"
[ ] Set to: npm run build
[ ] Find "Start Command"
[ ] Set to: npm run preview
```

### Stage 3: Environment Variables (10 min)

#### API Service Variables
```
[ ] Click on API service
[ ] Go to "Variables" tab
[ ] Click "Add Variable"
[ ] Add each of these:

    NODE_ENV = production
    [ ] Added?
    
    PORT = 3000
    [ ] Added?
    
    DATABASE_URL = postgresql://...
    [ ] Added? (copy from DATABASE_URL above)
    
    JWT_SECRET = <64-char-hex>
    [ ] Added? (from Node command above)
    
    CORS_ORIGIN = https://[WEB_DOMAIN].railway.app
    [ ] Added? (We'll get web domain below)
    
    API_URL = https://[API_DOMAIN].railway.app
    [ ] Added? (We'll get API domain below)
```

#### Get Domain Names
```
[ ] Click API service → "Network" → Copy domain
    API Domain: api-production-__________.railway.app

[ ] Click Web service → "Network" → Copy domain
    Web Domain: web-production-__________.railway.app
    
[ ] Update CORS_ORIGIN and API_URL with actual domains
```

#### Web Service Variables
```
[ ] Click on Web service
[ ] Go to "Variables" tab
[ ] Click "Add Variable"
[ ] Add each of these:

    VITE_API_URL = https://[API_DOMAIN].railway.app
    [ ] Added? (use API domain from above)
    
    VITE_API_SOCKET_URL = https://[API_DOMAIN].railway.app
    [ ] Added? (same as above)
```

### Stage 4: Deploy & Test (10 min)

#### Trigger Deployment
```
[ ] Push a commit to main branch
    git add . && git commit -m "Railway deployment config" && git push
    
OR

[ ] Services auto-deploy (railway may have already started)
[ ] Check logs for each service
```

#### Wait for Build
```
[ ] API service building... (watch logs)
    Completed: [ ]
    No errors: [ ]
    Server running message: [ ]
    
[ ] Web service building... (watch logs)
    Completed: [ ]
    No errors: [ ]
```

#### Test API
```
[ ] Open terminal and run:
    curl https://[API_DOMAIN].railway.app/api/health
    
[ ] Should show: {"status":"ok","timestamp":"..."}
    Success: [ ]
```

#### Test Web App
```
[ ] Open browser to:
    https://[WEB_DOMAIN].railway.app
    
[ ] Should see Visitour landing page
    Page loads: [ ]
    No console errors: [ ]
```

### Stage 5: Full Feature Test (10 min)

```
[ ] Click "Register"
[ ] Create new account
    Email: test@example.com
    Password: SecurePass123!
    Account created: [ ]

[ ] Login with account
    Login successful: [ ]
    Token stored: [ ]
    Redirected to dashboard: [ ]

[ ] Create new itinerary
    Click "Create Itinerary": [ ]
    Enter title: "Test Trip": [ ]
    Select dates: [ ]
    Submit: [ ]
    Appears in dashboard: [ ]

[ ] Add entry to itinerary
    Click itinerary: [ ]
    Click "Add Entry": [ ]
    Fill in activity details: [ ]
    Submit: [ ]
    Entry appears in list: [ ]

[ ] Test Real-Time (WebSocket)
    Open 2 browser windows to dashboard: [ ]
    Login both with same account: [ ]
    Edit entry in window 1: [ ]
    Entry updates instantly in window 2: [ ]
    Real-time working: [ ]

[ ] Test Edit/Delete
    Edit an entry: [ ]
    Delete an entry: [ ]
```

---

## 🎯 SUCCESS INDICATORS

When deployment is complete, you should see:

✅ Green checkmarks next to all above: **DEPLOYMENT SUCCESSFUL!**

---

## 🚨 IF SOMETHING FAILS

### API Won't Start
```
[ ] Check logs: Click API service → "Logs"
[ ] Look for error message
[ ] Common causes:
    - Wrong DATABASE_URL
    - Missing PORT=3000
    - Missing NODE_ENV
    
[ ] Fix variables
[ ] Redeploy: git push or click service → "Redeploy"
```

### Can't Reach API
```
[ ] Verify domain is correct
[ ] Check API logs for startup errors
[ ] Verify CORS_ORIGIN is in API env vars
[ ] Verify DATABASE_URL format
```

### Web App Won't Build
```
[ ] Check logs: Click Web service → "Logs"
[ ] Look for build errors
[ ] Common causes:
    - Wrong root directory (should be apps/web)
    - Build command incorrect
    - Missing dependencies
    
[ ] Fix settings
[ ] Redeploy: git push or click service → "Redeploy"
```

### Can't Reach Web App
```
[ ] Verify domain is correct
[ ] Check that web service built successfully
[ ] Open browser console (F12) for errors
[ ] Check VITE_API_URL is correct
```

### WebSocket Not Working
```
[ ] Check CORS_ORIGIN includes web domain
[ ] Verify API WebSocket is enabled
[ ] Check browser console for connection errors
[ ] Verify socket.io is in dependencies
```

---

## 📊 MONITORING

After deployment, monitor these:

```
Daily:
[ ] Check app is working
[ ] No console errors
[ ] Entries sync in real-time

Weekly:
[ ] Check Railway dashboard for credit usage
    Free tier credit used: ______ out of $5
    
[ ] Monitor logs for errors
[ ] Check database size

Monthly:
[ ] Review billing
[ ] Check if optimization needed
```

---

## 💾 IMPORTANT INFO TO SAVE

```
Project ID: ____________________________
API Domain: api-production-___________.railway.app
Web Domain: web-production-___________.railway.app
JWT Secret: ________________________________
Database URL: _______________________________
```

---

## 📝 NOTES

```
Deployment date: _____________
Deployed by: _________________
Any issues encountered: ________
Solutions applied: ___________
Follow-up tasks: ______________
```

---

## ✨ FINAL CHECKLIST

```
[ ] App is live and accessible
[ ] All features work
[ ] No errors in logs
[ ] Credit usage is acceptable
[ ] Backups configured (optional)
[ ] Monitoring set up (optional)
[ ] Custom domain configured (optional)
[ ] Team notified of live URL
```

---

## 🎉 YOU DID IT!

Your Visitour app is now deployed to Railway and running 24/7!

**Share your app URL:** https://web-production-___________.railway.app

---

**Remember:**
- App auto-deploys on git push
- Check logs if something breaks
- Monitor free tier credit
- Optimize if needed to stay free

**Happy deploying! 🚂✨**

---

**Date Created:** May 2, 2026
**Status:** ✅ Ready to Use

