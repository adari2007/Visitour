# 🚂 Deploy Visitour to Railway (FREE TIER)

Railway offers a **free tier with $5/month of credit** - more than enough for this app to run 24/7!

**This guide covers:**
- ✅ Setting up Railway account
- ✅ Deploying the Backend API
- ✅ Setting up PostgreSQL database
- ✅ Deploying the Web App
- ✅ Configuring environment variables
- ✅ Custom domain & SSL (coming to free tier)

---

## 📋 Prerequisites

You'll need:
1. **GitHub account** (to connect your repo)
2. **Railroad.dev account** ← **Sign up here:** https://railway.app
3. **Git** configured on your machine
4. **Visitour repo** pushed to GitHub (public or private)

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Your Repository

First, ensure your entire Visitour repo is on GitHub:

```bash
cd /Users/tadar01/Documents/GitHub/Visitour
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

**Note:** If you haven't set up Git yet:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Visitour.git
git push -u origin main
```

---

### Step 2: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start Free"** or **"Sign Up"**
3. Choose **"GitHub"** for authentication (easiest)
4. Authorize Railway to access your GitHub account
5. ✅ You now have **$5/month free credit**

---

### Step 3: Create a New Project

1. In your Railway dashboard, click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your **Visitour** repository
4. Railway will automatically scan your repo

---

### Step 4: Deploy PostgreSQL Database

1. In your Railway project, click **"+ Add Service"**
2. Search for **"PostgreSQL"** or select from templates
3. Click **"Deploy"**
4. Railway auto-generates credentials

#### Get Database Credentials:
- Click the PostgreSQL service
- Go to the **"Connect"** tab
- Copy these values:
  - `PGHOST` → Database host
  - `PGUSER` → Username (usually `postgres`)
  - `PGPASSWORD` → Auto-generated password
  - `PGDATABASE` → Database name
  - `PGPORT` → 5432

**Important:** Save these! You'll need them for your API.

---

### Step 5: Deploy Backend API

#### 5.1 Add Backend Service

1. In your project, click **"+ Add Service"**
2. Select **"GitHub Repo"**
3. Choose your Visitour repo again
4. Set the **Root Directory** to `apps/api`

#### 5.2 Configure Build Settings

1. Click your **API service**
2. Go to **Settings**
3. Set **Build Command**:
   ```bash
   npm install
   ```
4. Set **Start Command**:
   ```bash
   npm run start
   ```
   
   Or if that doesn't work, use:
   ```bash
   node src/server.js
   ```

#### 5.3 Set Environment Variables

1. In the API service, go to **"Variables"** tab
2. Add these variables (get PGHOST, etc. from Step 4):

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://<PGUSER>:<PGPASSWORD>@<PGHOST>:<PGPORT>/<PGDATABASE>
JWT_SECRET=your-super-secret-key-change-this-to-something-long-and-random
CORS_ORIGIN=https://your-web-app-domain.railway.app
API_URL=https://your-api-domain.railway.app
```

**⚠️ Important:** Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 6: Deploy Web App

#### 6.1 Add Web Service

1. In your project, click **"+ Add Service"**
2. Select **"GitHub Repo"**
3. Choose your Visitour repo
4. Set **Root Directory** to `apps/web`

#### 6.2 Configure Build Settings

1. Click your **Web service**
2. Go to **Settings**
3. Set **Build Command**:
   ```bash
   npm run build
   ```
4. Set **Start Command**:
   ```bash
   npm run preview
   ```

#### 6.3 Set Environment Variables

1. Go to **"Variables"** tab
2. Add:

```env
VITE_API_URL=https://your-api-domain.railway.app
VITE_API_SOCKET_URL=https://your-api-domain.railway.app
```

**Note:** Replace `your-api-domain.railway.app` with your actual API domain (see Step 7)

---

### Step 7: Get Your Domain Names

Railway auto-generates domain names. To find them:

1. **For API Service:**
   - Click API service → **"Network"** tab
   - Find **"Domains"** section
   - Copy the domain (looks like: `api-production-xxxx.railway.app`)

2. **For Web Service:**
   - Click Web service → **"Network"** tab
   - Copy the domain (looks like: `web-production-xxxx.railway.app`)

**Important:** Update the Web app environment variables with the correct API domain!

---

### Step 8: Verify Deployments

#### Check API Status:
```bash
curl https://your-api-domain.railway.app/api/health
```

You should see:
```json
{"status":"ok","timestamp":"..."}
```

#### Check Web App:
Open in browser: `https://your-web-domain.railway.app`

You should see the Visitour homepage!

---

## 🔧 Common Issues & Fixes

### Issue: API keeps crashing

**Solution:**
1. Check logs: Click API service → **"Logs"** tab
2. Common causes:
   - `DATABASE_URL` is wrong → verify in PostgreSQL service
   - `PORT` is not 3000 → set it to 3000
   - Missing dependencies → ensure `npm install` runs

**Fix:**
```bash
# Check your server.ts for any hardcoded ports/configs
# They should use environment variables instead
```

---

### Issue: Web app can't connect to API

**Solution:**
1. Verify `VITE_API_URL` matches your actual API domain
2. Check CORS is configured correctly in backend:

```typescript
// In apps/api/src/config/environment.ts
// Should have your web domain added to cors.origin
```

---

### Issue: Database connection fails

**Solution:**
1. Verify `DATABASE_URL` format:
   ```
   postgresql://user:password@host:port/database
   ```
2. Check password has no special characters (or URL-encode them)
3. Restart PostgreSQL service in Railway dashboard

---

### Issue: Running out of free tier credit

**Total costs for free tier:**
- **PostgreSQL**: ~$10-15/month (but you get $5 free)
- **API service**: ~$5-7/month (depends on traffic)
- **Web service**: ~$2-3/month (very small)

**Solutions:**
- Scale down: Use shared database (Railway default)
- Add payment method when ready to upgrade
- Monitor usage: Dashboard shows live spending

---

## 📈 Monitor Your App

### View Logs:
1. Click each service
2. Go to **"Logs"** tab
3. See real-time output

### Check Usage:
1. Dashboard shows credit usage
2. Each service shows resource usage
3. Free tier refreshes monthly

### Set Alerts:
1. Settings → **"Plans & Billing"**
2. Enable billing alerts

---

## 🎯 Next Steps After Deployment

### 1. Set Up Custom Domain (OPTIONAL)

Visit your project settings to add a custom domain like `visitour.youromain.com`

### 2. Enable HTTPS

Railway auto-enables HTTPS on all `.railway.app` domains

### 3. Set Up Monitoring

Add monitoring tools:
- Sentry for error tracking
- Datadog for performance monitoring
- LogRocket for frontend issues

### 4. Automate Deployments

Every push to `main` branch auto-deploys!

---

## 💡 Pro Tips

### Tip 1: Use Railway CLI for Local Testing
```bash
npm install -g @railway/cli
railway link  # Connect to your Railway project
railway run npm run dev  # Use Railway env variables locally
```

### Tip 2: Seed Database
After first deploy, you might want to add test data:
```bash
# Create a migration script
# Upload via Railway CLI or GitHub Actions
```

### Tip 3: Scale Resources
If your app gets slow:
1. Click service → **"Settings"**
2. Increase RAM/CPU allocation
3. Free tier allows you to scale

### Tip 4: Use GitHub Actions for CI/CD
Create `.github/workflows/deploy.yml` for automatic testing before deploy

---

## 📊 Railway vs Other Free Platforms

| Platform | Free Tier | Database | Limits |
|----------|-----------|----------|--------|
| **Railway** | $5/month | ✅ PostgreSQL | Generous |
| **Render** | $0 | ✅ PostgreSQL | Spins down after 15min idle |
| **Heroku** | $0 | ✅ PostgreSQL | Shutting down free tier Sept 2023 |
| **Vercel** | ✅ (Web only) | ✗ | No backend, only serverless |
| **Vercel + Serverless API** | ✅ | ✅ (extra cost) | Complex setup |

**Railway is the best choice for full-stack apps on free tier!**

---

## 🆘 Need Help?

1. **Railway Docs**: https://docs.railway.app
2. **Railway Community**: https://discord.gg/railway
3. **API Troubleshooting**: Check `apps/api/src/config/environment.ts`
4. **Web Troubleshooting**: Check `apps/web/src/services/api.ts`

---

## ✅ Deployment Checklist

- [ ] Visitour repo is on GitHub
- [ ] Signed up for Railway
- [ ] Created new project
- [ ] Deployed PostgreSQL
- [ ] Set API root directory to `apps/api`
- [ ] Set Web root directory to `apps/web`
- [ ] Added all environment variables
- [ ] API domain is working (`/api/health` responds)
- [ ] Web app loads in browser
- [ ] Can register/login successfully
- [ ] Can create itineraries
- [ ] Can add entries (WebSocket works)

---

## 🎉 You're Live!

Once everything is working, celebrate! Your Visitour app is live and:

✅ **Running 24/7** on the free tier
✅ **Auto-deploys** when you push to GitHub
✅ **Has a real database** with PostgreSQL
✅ **Supports real-time updates** with WebSocket
✅ **Gets $5/month free credit** (usually enough!)

---

**Happy deploying! Your travelers await! 🚂🌍✈️**

---

## 📝 Post-Deployment Tasks

### 1. Test All Features
- [ ] Register new user
- [ ] Login
- [ ] Create itinerary
- [ ] Add entries
- [ ] Edit entries
- [ ] Delete entries
- [ ] Real-time updates (open 2 browser windows)

### 2. Performance Testing
- [ ] Check page load time (target: <2s)
- [ ] Check API response time (target: <200ms)
- [ ] Test on mobile browser

### 3. Security Check
- [ ] Verify passwords not in logs
- [ ] Check JWT_SECRET is strong
- [ ] Verify HTTPS is enforced
- [ ] Test CORS restrictions

### 4. Backup Strategy
- [ ] Export PostgreSQL data regularly
- [ ] Keep GitHub repo as backup
- [ ] Consider database snapshots

---

**Version**: 1.0.0
**Last Updated**: May 2, 2026
**Status**: ✅ Ready to Deploy!

