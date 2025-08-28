# Pwani Love - Local Deployment with XAMPP

## Overview
This guide will help you deploy the Pwani Love dating app locally using XAMPP and display the mobile frontend on your laptop.

## Prerequisites
- XAMPP installed on your Windows machine
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Git (optional)

## Step 1: XAMPP Setup

### 1.1 Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP with default settings
3. Start XAMPP Control Panel

### 1.2 Configure Apache for Node.js Backend
1. Open XAMPP Control Panel
2. Start Apache and MySQL services
3. Navigate to `C:\xampp\apache\conf\extra\`
4. Create a new file called `httpd-nodejs.conf`

```apache
# Node.js Proxy Configuration for Pwani Love
<VirtualHost *:80>
    ServerName pwani-love.local
    ServerAlias www.pwani-love.local
    
    # Proxy backend API requests to Node.js server
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
    
    # Serve React Native Web frontend
    DocumentRoot "C:/Users/etidi/Desktop/Pwanilove/client/web-build"
    <Directory "C:/Users/etidi/Desktop/Pwanilove/client/web-build">
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
    </Directory>
    
    # Handle React Router
    <Directory "C:/Users/etidi/Desktop/Pwanilove/client/web-build">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 1.3 Enable Required Apache Modules
1. Open `C:\xampp\apache\conf\httpd.conf`
2. Uncomment these lines (remove #):
```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so
```

### 1.4 Include Node.js Configuration
Add this line at the end of `httpd.conf`:
```apache
Include conf/extra/httpd-nodejs.conf
```

### 1.5 Update Hosts File
1. Open `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Add this line:
```
127.0.0.1 pwani-love.local
```

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd C:\Users\etidi\Desktop\Pwanilove
npm run install-all
```

### 2.2 Configure Environment Variables
1. Copy `.env.example` to `.env` in the root directory
2. Update the following variables:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://pwani-love.local
JWT_SECRET=your-super-secret-jwt-key-here
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SOCKET_CORS_ORIGIN=http://pwani-love.local
```

### 2.3 Start Backend Server
```bash
npm run dev
```

## Step 3: Frontend Setup

### 3.1 Install Client Dependencies
```bash
cd client
npm install
```

### 3.2 Configure Client Environment
Create `client/.env`:
```env
EXPO_PUBLIC_API_URL=http://pwani-love.local/api
EXPO_PUBLIC_SOCKET_URL=http://pwani-love.local
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

### 3.3 Build for Web
```bash
cd client
npm run build:web
```

### 3.4 Start Development Server (Alternative)
```bash
cd client
npm start
```

## Step 4: Display Mobile Frontend on Laptop

### Option 1: Expo Web (Recommended)
1. Start the Expo development server:
```bash
cd client
npm start
```

2. Press `w` to open in web browser
3. The app will open at `http://localhost:19006`

### Option 2: Android Emulator
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Start the emulator
4. Run: `npm run android`

### Option 3: iOS Simulator (Mac only)
1. Install Xcode
2. Start iOS Simulator
3. Run: `npm run ios`

### Option 4: Physical Device
1. Install Expo Go app on your phone
2. Scan the QR code from `npm start`
3. The app will load on your device

## Step 5: Testing the Setup

### 5.1 Test Backend API
Visit: `http://pwani-love.local/api/health`
Should return: `{"status":"ok","message":"Pwani Love API is running"}`

### 5.2 Test Frontend
Visit: `http://pwani-love.local`
Should show the Pwani Love app

### 5.3 Test Mobile Version
Visit: `http://localhost:19006`
Should show the mobile-optimized version

## Step 6: Troubleshooting

### Common Issues:

1. **Port 5000 already in use**
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Apache won't start**
   - Check if port 80 is in use
   - Try changing Apache port to 8080

3. **CORS errors**
   - Ensure `SOCKET_CORS_ORIGIN` is set correctly
   - Check that Apache proxy is working

4. **Firebase connection issues**
   - Verify Firebase credentials in `.env`
   - Check Firebase project settings

5. **Cloudinary upload fails**
   - Verify Cloudinary credentials
   - Check file size limits

## Step 7: Production Considerations

### 7.1 Security
- Change default passwords
- Use HTTPS in production
- Set up proper firewall rules
- Regular security updates

### 7.2 Performance
- Enable Apache compression
- Use CDN for static assets
- Implement caching strategies
- Monitor server resources

### 7.3 Backup
- Regular database backups
- Code version control
- Environment configuration backup

## Access URLs

- **Backend API**: `http://pwani-love.local/api`
- **Frontend Web**: `http://pwani-love.local`
- **Mobile Development**: `http://localhost:19006`
- **XAMPP Control**: `http://localhost/xampp`

## Next Steps

1. Set up Firebase project and get credentials
2. Configure Cloudinary account
3. Get Google Maps API key
4. Test all features thoroughly
5. Deploy to production when ready

Your Pwani Love app is now ready for local development and testing!
