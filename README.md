# Pwani Love - Dating App

A modern, feature-rich dating application built with React Native and Node.js, designed to connect people in the Pwani region and beyond.

## 🌟 Features

### Core Features
- **User Authentication**: Secure registration and login with Firebase Auth
- **Profile Management**: Complete user profiles with photos, bio, and preferences
- **Smart Matching**: Location-based matching with advanced filtering
- **Swipe Interface**: Intuitive swipe gestures for like/dislike/super like
- **Real-time Chat**: Instant messaging with Socket.IO
- **Push Notifications**: Real-time notifications for matches and messages
- **Location Services**: GPS-based user discovery
- **Media Upload**: Photo uploads with Cloudinary integration

### Advanced Features
- **Super Like**: Premium feature to stand out
- **Profile Verification**: Verified user badges
- **Distance Filtering**: Find matches within your preferred radius
- **Age & Gender Preferences**: Customizable matching criteria
- **Typing Indicators**: Real-time typing status in chats
- **Message Status**: Read receipts and delivery status
- **Dark/Light Theme**: User preference themes
- **Offline Support**: Basic offline functionality

## 🛠 Tech Stack

### Frontend (React Native)
- **React Native** with Expo
- **React Navigation** for routing
- **React Query** for state management
- **Socket.IO Client** for real-time features
- **Firebase SDK** for authentication
- **Expo Location** for GPS services
- **React Native Maps** for location features
- **Expo Image Picker** for media selection
- **React Native Gesture Handler** for swipe interactions

### Backend (Node.js)
- **Express.js** web framework
- **Firebase Admin SDK** for authentication
- **Firebase Firestore** for database
- **Firebase Realtime Database** for chat
- **Socket.IO** for real-time communication
- **Cloudinary** for media storage
- **JWT** for token-based authentication
- **Multer** for file uploads
- **Express Validator** for input validation

### Infrastructure
- **Firebase** (Auth, Firestore, Realtime Database)
- **Cloudinary** (Media storage and optimization)
- **Google Maps API** (Location services)
- **Socket.IO** (Real-time messaging)

## 📱 Screenshots

*Screenshots will be added here*

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Cloudinary account
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pwani-love.git
   cd pwani-love
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

   Create `.env` file in the client directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Create Realtime Database
   - Download service account key
   - Update environment variables

6. **Cloudinary Setup**
   - Create a Cloudinary account
   - Get your cloud name, API key, and secret
   - Update environment variables

7. **Google Maps Setup**
   - Create a Google Cloud project
   - Enable Maps JavaScript API
   - Create API key
   - Update environment variables

### Running the Application

1. **Start the backend server**
   ```bash
   # From root directory
   npm run dev
   ```

2. **Start the React Native app**
   ```bash
   # From client directory
   npm start
   ```

3. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press 'i' for iOS simulator
   - Or press 'a' for Android emulator

## 📁 Project Structure

```
pwani-love/
├── server/                 # Backend Node.js server
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── users.js       # User management routes
│   │   ├── matches.js     # Matching routes
│   │   ├── chat.js        # Chat routes
│   │   └── upload.js      # File upload routes
│   └── index.js           # Main server file
├── client/                # React Native frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # App screens
│   │   │   ├── auth/      # Authentication screens
│   │   │   └── main/      # Main app screens
│   │   ├── context/       # React Context providers
│   │   ├── theme/         # Theme configuration
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Images, fonts, etc.
│   ├── App.js             # Main app component
│   └── package.json       # Frontend dependencies
├── package.json           # Backend dependencies
└── README.md             # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify` - Verify Firebase token

### Users
- `GET /api/users/discover` - Get potential matches
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/search/:query` - Search users

### Matches
- `POST /api/matches/like/:userId` - Like a user
- `POST /api/matches/dislike/:userId` - Dislike a user
- `POST /api/matches/superlike/:userId` - Super like a user
- `GET /api/matches` - Get user's matches
- `GET /api/matches/likes` - Get received likes
- `GET /api/matches/superlikes` - Get received super likes

### Chat
- `GET /api/chat/:matchId` - Get chat messages
- `POST /api/chat/:matchId` - Send message
- `PUT /api/chat/:matchId/read` - Mark messages as read
- `DELETE /api/chat/:matchId/:messageId` - Delete message
- `GET /api/chat/unread/count` - Get unread count
- `POST /api/chat/:matchId/typing` - Send typing indicator

### Upload
- `POST /api/upload/profile-photos` - Upload profile photos
- `POST /api/upload/chat-media/:matchId` - Upload chat media
- `DELETE /api/upload/delete/:publicId` - Delete uploaded media
- `POST /api/upload/validate` - Validate image
- `POST /api/upload/signed-url` - Generate signed upload URL

## 🔒 Security Features

- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- File upload validation
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Set environment variables
3. Deploy with Git:
   ```bash
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

### Frontend Deployment (Expo)
1. Build for production:
   ```bash
   expo build:android
   expo build:ios
   ```
2. Or publish to Expo:
   ```bash
   expo publish
   ```

### Firebase Deployment
1. Initialize Firebase:
   ```bash
   firebase init
   ```
2. Deploy:
   ```bash
   firebase deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for React Native development platform
- React Native community for excellent libraries
- Cloudinary for media management
- Socket.IO for real-time features

## 📞 Support

For support, email support@pwani-love.com or create an issue in this repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added super like functionality
- **v1.2.0** - Enhanced chat features
- **v1.3.0** - Added dark theme support

---

Made with ❤️ for the Pwani region
