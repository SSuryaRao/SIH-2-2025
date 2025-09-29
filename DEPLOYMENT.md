# Deployment Guide

This guide covers deploying your College ERP System with the frontend on Vercel and backend on Render.

## Prerequisites

1. GitHub repository with your code
2. Vercel account
3. Render account
4. Firebase project setup

## Backend Deployment (Render)

### 1. Environment Variables Setup

In your Render dashboard, set these environment variables for your backend service:

```env
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend-url.vercel.app
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
JWT_EXPIRE=7d
```

### 2. Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select your repository
4. Use these settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
   - **Health Check Path**: `/api/health`

### 3. Configure Auto-Deploy

Enable auto-deploy from your main branch for automatic deployments on code changes.

## Frontend Deployment (Vercel)

### 1. Environment Variables Setup

In your Vercel project settings, add this environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 2. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Create a new project
3. Use these settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configure Vercel Settings

The `vercel.json` file in the frontend directory contains the deployment configuration.

## Post-Deployment Steps

### 1. Update Environment Variables

After both services are deployed:

1. Update the `FRONTEND_URL` in your Render backend service with your actual Vercel URL
2. Update the `NEXT_PUBLIC_API_URL` in your Vercel frontend with your actual Render URL

### 2. Test the Deployment

1. Visit your frontend URL
2. Check that API calls are working properly
3. Verify Firebase authentication is functioning
4. Test all major features

### 3. Domain Configuration (Optional)

- Configure custom domains in both Vercel and Render dashboards
- Update CORS settings if using custom domains

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` in backend matches your actual frontend URL
2. **Firebase Errors**: Verify all Firebase environment variables are correctly set
3. **Build Failures**: Check Node.js version compatibility (requires Node 16+)
4. **API Connection Issues**: Verify `NEXT_PUBLIC_API_URL` points to correct backend URL

### Logs

- **Render**: Check logs in your Render dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **Firebase**: Check Firebase console for authentication issues

## Security Checklist

- [ ] All environment variables are properly set
- [ ] JWT secret is strong and unique
- [ ] Firebase security rules are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced on both services

## Monitoring

- Set up monitoring in both Render and Vercel dashboards
- Configure alerting for service downtime
- Monitor API response times and error rates