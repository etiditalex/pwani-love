import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDatabase, ref, set, get } from 'firebase/database';
import axios from 'axios';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

// API base URL - Updated for XAMPP deployment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get custom token from Firebase
        const customToken = await firebaseUser.getIdToken();
        setToken(customToken);
        
        // Get user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
        
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Create user with Firebase Auth
      const { email, password, firstName, lastName, dateOfBirth, gender, location, bio } = userData;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user profile in Firestore
      const userProfileData = {
        uid: firebaseUser.uid,
        email,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        location,
        bio: bio || '',
        photos: [],
        interests: [],
        preferences: {
          ageRange: { min: 18, max: 50 },
          distance: 50,
          gender: []
        },
        isProfileComplete: false,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
      setUserProfile(userProfileData);

      // Get custom token
      const customToken = await firebaseUser.getIdToken();
      setToken(customToken);

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get custom token
      const customToken = await firebaseUser.getIdToken();
      setToken(customToken);

      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date(),
        isProfileComplete: true
      });

      // Update local state
      setUserProfile(prev => ({ ...prev, ...profileData, isProfileComplete: true }));

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Update user location
  const updateLocation = async (latitude, longitude) => {
    try {
      if (!user) throw new Error('No user logged in');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        location: { latitude, longitude },
        updatedAt: new Date()
      });

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        location: { latitude, longitude }
      }));

      return { success: true };
    } catch (error) {
      console.error('Location update error:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // API request helper with authentication
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        headers,
        data: options.data,
        params: options.params,
      });

      return response.data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    userProfile,
    isLoading,
    token,
    isAuthenticated,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateLocation,
    getUserProfile,
    apiRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
