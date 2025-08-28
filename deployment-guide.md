# Pwani Love - Deployment Guide

## Overview
This guide will help you deploy the Pwani Love dating app backend to XAMPP and display the React Native frontend on your laptop.

## Prerequisites
- XAMPP installed on your system
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

## Part 1: Backend Deployment with XAMPP

### Step 1: Configure XAMPP
1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Note the Apache port (usually 80 or 8080)

### Step 2: Deploy Backend to XAMPP
1. Copy the `server` folder to: `C:\xampp\htdocs\pwani-love-api`
2. Open terminal in the server directory:
   ```bash
   cd C:\xampp\htdocs\pwani-love-api
   npm install
   ```

### Step 3: Configure Environment Variables
1. Create `.env` file in the server directory:
   ```env
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:19006
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   # Google Maps API
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Socket.IO Configuration
   SOCKET_CORS_ORIGIN=http://localhost:19006
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # File Upload Limits
   MAX_FILE_SIZE=10485760
   MAX_FILES=10
   ```

### Step 4: Start Backend Server
```bash
npm start
```
The API will be available at: `http://localhost:3000`

## Part 2: Frontend Setup and Display

### Step 1: Install Dependencies
```bash
cd client
npm install
```

### Step 2: Configure Frontend for Local Development
1. Update `client/src/context/AuthContext.js` to point to local backend:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

### Step 3: Start React Native Development Server
```bash
cd client
npx expo start
```

### Step 4: Display on Laptop

#### Option A: Web Browser (Recommended for Development)
1. When Expo starts, press `w` to open in web browser
2. The app will open at: `http://localhost:19006`
3. You can now use the dating app directly in your browser

#### Option B: Android Emulator
1. Install Android Studio
2. Create and start an Android Virtual Device (AVD)
3. When Expo starts, press `a` to open in Android emulator

#### Option C: iOS Simulator (Mac only)
1. Install Xcode
2. When Expo starts, press `i` to open in iOS simulator

#### Option D: Physical Device
1. Install Expo Go app on your phone
2. Scan the QR code displayed by Expo
3. The app will load on your device

## Part 3: Database Setup

### Option A: Firebase (Recommended)
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, and Realtime Database
3. Download service account key and update `.env` file
4. Set up Firestore security rules

### Option B: Local MySQL (XAMPP)
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create database: `pwani_love`
3. Import the provided SQL schema (if available)

## Part 4: Testing the Deployment

### Test Backend API
1. Open browser and go to: `http://localhost:3000/api/health`
2. You should see: `{"status":"ok","message":"Pwani Love API is running"}`

### Test Frontend
1. Open: `http://localhost:19006`
2. You should see the Pwani Love app interface
3. Test registration and login functionality

## Part 5: Production Considerations

### Security
- Change default passwords
- Use strong JWT secrets
- Enable HTTPS in production
- Configure CORS properly

### Performance
- Enable compression
- Use CDN for static assets
- Optimize images
- Implement caching

### Monitoring
- Set up logging
- Monitor API performance
- Track user analytics

## Troubleshooting

### Common Issues

#### Backend won't start
- Check if port 3000 is available
- Verify all environment variables are set
- Check Node.js version compatibility

#### Frontend won't load
- Ensure Expo CLI is installed globally
- Check if all dependencies are installed
- Verify API base URL configuration

#### Database connection issues
- Verify Firebase credentials
- Check network connectivity
- Ensure Firestore rules allow read/write

#### CORS errors
- Update CORS configuration in backend
- Check client URL in environment variables

### Getting Help
- Check the console for error messages
- Verify all prerequisites are installed
- Ensure all environment variables are configured

## Next Steps
1. Set up Firebase project and configure credentials
2. Configure Cloudinary for media uploads
3. Set up Google Maps API key
4. Test all features: registration, matching, chat
5. Deploy to production when ready

## Support
For additional help, refer to:
- React Native documentation
- Expo documentation
- Firebase documentation
- XAMPP documentation
