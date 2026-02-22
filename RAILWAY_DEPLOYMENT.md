# Railway Deployment Guide

## Setup Complete ✅

Your project is now configured for single-command Railway deployment:

### What's been done:
1. **Client build → Server public folder**: Updated `npm run build` to:
   - Build React/Vite client to `client/dist`
   - Copy entire `dist` folder to `server/public`
   
2. **Server configured to serve UI**: Updated `server/server.js` to:
   - Serve all static files from `server/public`
   - Route non-API requests to `index.html` (SPA routing)
   - Keep all `/api/*` routes working as normal

3. **Single entry point**: `npm start` runs `node server.js` which:
   - Serves the React UI from `server/public`
   - Handles all API requests
   - Works on any port (Railway sets `PORT` env var)

---

## Deploy to Railway

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### 2. Connect Your GitHub Repo
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Railway auto-detects Node.js

### 3. Set Environment Variables
In Railway dashboard, add these variables under your project settings:

```
MONGODB_URI=<your-mongodb-atlas-connection-string>
GROQ_API_KEY=<your-groq-api-key>
JWT_SECRET=<generate-a-random-secret-key>
NODE_ENV=production
```

To generate a JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configure Build & Start Commands
Railway should auto-detect these, but verify in Settings:
- **Build Command**: `npm run install-all && npm run build`
- **Start Command**: `npm start`

### 5. Deploy
- Push to your GitHub repo
- Railway auto-deploys on every push
- Get your public Railway URL from the dashboard

### 6. Update CORS (Optional)
If you encounter CORS issues, update `server/server.js` allowedOrigins:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://your-railway-url.up.railway.app'  // Add your Railway URL
];
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Updated `build` script: `cd client && npm run build && cp -r dist ../server/public` |
| `server/server.js` | Added static serve from `server/public` + SPA routing |
| `server/public/` | Created folder (auto-populated by build script) |
| `.gitignore` | Added `server/public/` and `client/dist/` |

---

## Local Testing (Optional)

To test locally before deploying:

```bash
# Clean build
rm -rf server/public client/dist

# Build and copy
npm run build

# Start server (uses server/public)
cd server && npm start
```

Then visit `http://localhost:5000` (or whatever PORT is set).

---

## Support
- **Build fails?** Check MongoDB connection and API keys in `.env`
- **CORS errors?** Update allowedOrigins in `server/server.js`
- **UI not loading?** Verify `server/public/index.html` exists after build
