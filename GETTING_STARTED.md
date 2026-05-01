# 🚀 Quick Start - No Docker Required

Your Visitour app is being installed! Here's what's happening:

## ✅ Installation Status
- Backend dependencies: Installing...
- Web app dependencies: Installing...
- Database: SQLite (local file, no setup needed!)

## 📋 What You'll Be Able to Access

Once installation completes, you can access:

| Application | URL | Command |
|-------------|-----|---------|
| **Web App** | http://localhost:5173 | `cd apps/web && npm run dev` |
| **API** | http://localhost:3000 | `cd apps/api && npm run dev` |
| **pgAdmin** | http://localhost:5050 | (Not needed - using SQLite) |

## 🎯 Next Steps (After Installation Completes)

### 1. Start Backend (Terminal 1)
```bash
cd /Users/tadar01/Documents/GitHub/Visitour/apps/api
npm run dev
```

You should see:
```
✓ Connected to SQLite
✓ Database initialized
✓ Server running on http://localhost:3000
✓ WebSocket available at ws://localhost:3000
```

### 2. Start Web App (Terminal 2)
```bash
cd /Users/tadar01/Documents/GitHub/Visitour/apps/web
npm run dev
```

Then open: **http://localhost:5173**

## 🔐 First Time Setup

1. Click "Register" 
2. Create an account:
   - Email: test@example.com
   - Password: password123
3. Create a new itinerary
4. Add activities for each day

## 📱 Mobile App (Optional)

For mobile, you'd need to install Expo separately:
```bash
npm install -g expo-cli
cd /Users/tadar01/Documents/GitHub/Visitour/apps/mobile
npm install
npm run dev
```

---

**Installation takes 2-5 minutes. Check back soon!**

