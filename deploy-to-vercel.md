# 🚀 Deploy Pwani Love to Vercel

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

## Step 1: Push to GitHub

### Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **"New repository"**
3. Name it: `pwani-love-dating-app`
4. Make it **Public**
5. Click **"Create repository"**

### Push Your Code
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Pwani Love Dating App"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/pwani-love-dating-app.git

# Push
git push -u origin main
```

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/.expo/web-build`

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: pwani-love
# - Directory: ./
```

## Step 3: Environment Variables

In Vercel dashboard, add these environment variables:

### Backend Variables
```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Frontend Variables
```
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 4: Build Configuration

### Update client/package.json
Add build script:
```json
{
  "scripts": {
    "build": "expo build:web",
    "vercel-build": "expo build:web"
  }
}
```

### Update client/app.json
```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

## Step 5: Deploy

1. **Push changes to GitHub**
2. **Vercel will automatically deploy**
3. **Your app will be live at**: `https://your-app-name.vercel.app`

## 🎉 Success!

Your Pwani Love dating app will be live on:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-app-name.vercel.app/api`

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check environment variables
2. **API not working**: Verify backend routes
3. **Frontend not loading**: Check build output

### Debug Commands:
```bash
# Test locally
npm run build

# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

## 📱 Mobile App Deployment

For mobile app stores:
1. **Expo Application Services (EAS)**
2. **App Store Connect (iOS)**
3. **Google Play Console (Android)**

## 🔗 Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Build](https://docs.expo.dev/guides/web-build/)
- [Firebase Setup](https://firebase.google.com/docs)
