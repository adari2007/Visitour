# Railway Deployment Quick Reference Card

## 🚀 TL;DR - Deploy in 5 Steps

1. **Push to GitHub**
   ```bash
   git add . && git commit -m "Ready for Railway" && git push
   ```

2. **Go to railway.app**
   - Sign up with GitHub
   - Create new project
   - Connect your Visitour repo

3. **Add Services** (Railway dashboard)
   - PostgreSQL database
   - API service (root: `apps/api`)
   - Web service (root: `apps/web`)

4. **Configure** (set environment variables)
   ```
   API:
   - NODE_ENV=production
   - PORT=3000
   - DATABASE_URL=postgresql://...
   - JWT_SECRET=<random-64-char-key>
   - CORS_ORIGIN=https://your-web.railway.app

   WEB:
   - VITE_API_URL=https://your-api.railway.app
   - VITE_API_SOCKET_URL=https://your-api.railway.app
   ```

5. **Done!** Apps deploy in 2-5 minutes

---

## Domain Names (You'll Get)

After services start, check the **Network** tab in each service:

**API Service**
- Auto domain: `api-production-xxxx.railway.app`
- Use in web env vars
- Test: curl `https://api-production-xxxx.railway.app/api/health`

**Web Service**
- Auto domain: `web-production-xxxx.railway.app`
- This is your public URL for users
- Share this link!

---

## Important Environment Variables

### API Service Variables
```env
NODE_ENV=production         # Always this for deployed app
PORT=3000                  # Must be 3000
DATABASE_URL=...           # From PostgreSQL service
JWT_SECRET=...             # 64-character hex string (generate new one!)
CORS_ORIGIN=...            # Your web domain URL
```

### Web Service Variables
```env
VITE_API_URL=...           # Your API domain URL
VITE_API_SOCKET_URL=...    # Same as API URL for WebSocket
```

### Get DATABASE_URL From PostgreSQL Service
1. Click PostgreSQL service in Railway
2. Go to **Connect** tab
3. Copy the PostgreSQL connection string
4. Looks like: `postgresql://postgres:abc123def456@db-prod-xxxx.railway.internal:5432/railway`

### Generate JWT_SECRET
```bash
# Run this in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and use it as JWT_SECRET
```

---

## Troubleshooting Checklist

- [ ] Repo is on GitHub (public or private)
- [ ] Logged into railway.app with GitHub
- [ ] Created new project
- [ ] All 3 services added (PostgreSQL, API, Web)
- [ ] API root directory set to `apps/api`
- [ ] Web root directory set to `apps/web`
- [ ] Build commands are set correctly
- [ ] Start commands are set correctly
- [ ] All env vars added to correct services
- [ ] DATABASE_URL is correct format
- [ ] API domain is in `CORS_ORIGIN` var
- [ ] Web domain is in `VITE_API_URL` var
- [ ] Restarted services after env changes

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | API not reachable | Check API service logs, verify PORT=3000 |
| `Cannot find module` | Missing dependency | Ensure `npm install` runs in Build step |
| `ENOTFOUND` database | Wrong DATABASE_URL | Copy exact connection string from PostgreSQL |
| `CORS error` | Wrong CORS_ORIGIN | Update to exact web domain URL |
| `WebSocket fails` | CORS not configured | Ensure web domain in `CORS_ORIGIN` |
| `404 Not Found` | Wrong root directory | Verify `apps/api` and `apps/web` in settings |

---

## Cost & Credits

**Free Tier:** $5/month credit (refreshes monthly)

**Typical Monthly Usage:**
- API service: $7-10 (mostly in free tier)
- Web service: $2-3 (usually free)
- Database: $10-15 (mostly in free tier)

**Result:** Completely **FREE** most months!

**If you exceed:** Add payment method to continue ($0.000416/hour per resource)

---

## What to Test After Deploy

✅ Open web app in browser
✅ Create account
✅ Login
✅ Create itinerary
✅ Add entries to itinerary
✅ Open 2 browser windows to test real-time sync
✅ Edit/delete entries
✅ Check mobile connection (if using)

---

## Useful Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Your Project:** https://railway.app/project/[project-id]
- **API Health:** https://[api-domain].railway.app/api/health
- **Web App:** https://[web-domain].railway.app

---

## Pro Tips

1. **Use Railway CLI locally**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway run npm run dev  # Use Railway env vars locally
   ```

2. **View logs in real-time**
   - Dashboard → Each service → **Logs** tab
   - Shows everything printed to console

3. **Connect custom domain** (optional)
   - Project Settings → **Custom Domain**
   - Points to web service

4. **Auto-deploy on push**
   - Already enabled!
   - Just push to main branch

---

## File Reference

Key files for Railway to detect:

```
✅ apps/api/package.json
✅ apps/api/src/server.js (entry point)
✅ apps/web/package.json
✅ apps/web/vite.config.ts
✅ apps/web/index.html
✅ .railway.json (optional, we created this)
```

---

## Next Level: Automation

### GitHub Actions (CI/CD)
Create `.github/workflows/deploy.yml` to:
- Run tests before deploying
- Build & test on every push
- Only deploy if tests pass

### Custom Domain + SSL
- Add CNAME record pointing to Railway domain
- Enable SSL (automatic)
- Custom URL instead of `railway.app`

### Database Backups
- PostgreSQL service → Settings
- Enable automated backups
- Keep running backups to S3

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Discord Community:** https://discord.gg/railway
- **Status Page:** https://status.railway.app
- **GitHub Issues:** Check your Visitour repo

---

## Remember

The free tier is **extremely generous**! Your app runs:
- 24/7 without sleeping
- With a real PostgreSQL database
- With real-time WebSocket support
- With automatic SSL/HTTPS
- With unlimited deployments
- With auto-restart on failures

**Just keep an eye on your $5 monthly credit balance!**

---

**Happy Deploying! 🚂 Your app is about to go live! 🎉**

Created: May 2, 2026
Last Updated: May 2, 2026

