# StudentShield CyberSecurity - Vercel Deployment Guide

## Quick Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Step 4: Set Environment Variables
```bash
vercel env add VITE_API_URL production
# Enter: https://studentshield-backend.onrender.com
```

## Detailed Instructions

### Option A: Vercel Web Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Connect GitHub**: Click "New Project" > "Import Git Repository"
3. **Select Repository**: Choose `pranal-dotcom/StudentSheild_CyberSecurity`
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   - **VITE_API_URL**: `https://studentshield-backend.onrender.com`

6. **Deploy**: Click "Deploy"

### Option B: Vercel CLI

1. **Install CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Navigate to frontend**:
```bash
cd frontend
```

4. **Deploy**:
```bash
vercel --prod
```

5. **Set Environment Variables**:
```bash
vercel env add VITE_API_URL production
# When prompted, enter: https://studentshield-backend.onrender.com
```

6. **Redeploy**:
```bash
vercel --prod
```

## Configuration Files Created

### `frontend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://studentshield-backend.onrender.com"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Updated Components
All frontend components now use environment variables:
- `Login.jsx`
- `Register.jsx`
- `Dashboard.jsx`

## Environment Variables

### Required Variables
- **VITE_API_URL**: Backend API URL

### Local Development
Create `.env.local` in frontend folder:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### Production
Set in Vercel dashboard or CLI:
```env
VITE_API_URL=https://studentshield-backend.onrender.com
```

## Deployment URLs

After deployment:
- **Frontend**: `https://studentshield-frontend.vercel.app`
- **Backend**: `https://studentshield-backend.onrender.com`

## Troubleshooting

### Build Errors
1. Check `package.json` build script
2. Verify all dependencies are installed
3. Check for TypeScript errors

### API Connection Errors
1. Verify backend is running
2. Check VITE_API_URL environment variable
3. Ensure CORS is enabled on backend

### Route Errors
1. Check `vercel.json` routes configuration
2. Verify all routes redirect to `index.html`

## Post-Deployment Checklist

1. **Test Registration**: Create a new account
2. **Test Login**: Verify authentication works
3. **Test Dashboard**: Check all security tools
4. **Test API Calls**: Verify all endpoints work
5. **Check Console**: Look for any errors

## Next Steps

1. **Deploy Backend**: Use Railway, Render, or Heroku
2. **Update API URL**: Set correct backend URL in Vercel
3. **Test Integration**: Verify frontend-backend connection
4. **Monitor Performance**: Check Vercel analytics

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test backend separately
4. Check CORS configuration

## Alternative: Full-Stack Deployment

For complete deployment, consider:
- **Backend**: Railway (recommended)
- **Frontend**: Vercel (current)
- **Database**: MongoDB Atlas (configured)

This gives you the best performance and reliability for production.
