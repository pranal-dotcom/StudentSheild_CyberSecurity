# StudentShield CyberSecurity - Render Deployment Guide

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with username and password
5. Get your connection string from "Connect" > "Connect your application"
6. Your connection string will look like:
   `mongodb+srv://username:password@cluster.mongodb.net/student_shield_db?retryWrites=true&w=majority`

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect your `render.yaml` file
5. Review and deploy

### Option B: Manual Setup

### Backend Deployment:
1. Go to Render Dashboard
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. **Service Details:**
   - Name: `studentshield-backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables:**
   ```
   PORT=8000
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/student_shield_db?retryWrites=true&w=majority
   MONGODB_DB_NAME=student_shield_db
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ```

### Frontend Deployment:
1. Go to Render Dashboard
2. Click "New" > "Static Site"
3. Connect your GitHub repository
4. **Service Details:**
   - Name: `studentshield-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

## Step 3: Update Frontend API URLs

After backend deployment, update the frontend API URLs:

1. Go to your backend service on Render
2. Copy the URL (e.g., `https://studentshield-backend.onrender.com`)
3. Update these files in your frontend:
   - `src/components/Login.jsx`
   - `src/components/Register.jsx`
   - `src/components/Dashboard.jsx`
   - `src/components/ScanHistory.jsx`

Replace `http://127.0.0.1:8000` with your Render backend URL.

## Step 4: Test Your Deployment

1. Visit your frontend URL: `https://studentshield-frontend.onrender.com`
2. Test registration and login
3. Test all security tools
4. Verify database connectivity

## Important Notes:

### Backend Commands:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start locally for testing
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Health check
curl https://your-backend.onrender.com/
```

### Frontend Commands:
```bash
# Install dependencies
cd frontend && npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables:
- Never commit `.env` files to git
- Use Render's environment variables for production
- Use `.env.example` as a template

### Troubleshooting:
1. **Backend not starting**: Check environment variables
2. **Database connection errors**: Verify MongoDB Atlas connection string
3. **CORS errors**: Ensure frontend URL is allowed in backend CORS
4. **Build failures**: Check logs for specific error messages

## Production URLs:
- Backend: `https://studentshield-backend.onrender.com`
- Frontend: `https://studentshield-frontend.onrender.com`

## Security Notes:
- Change the default SECRET_KEY in production
- Use strong MongoDB credentials
- Enable HTTPS (Render does this automatically)
- Monitor logs for security issues
