const express = require('express');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get potential matches based on preferences and location
router.get('/discover', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, latitude, longitude, distance = 50 } = req.query;
    const currentUserId = req.user.uid;

    // Get current user's profile and preferences
    const currentUserDoc = await admin.firestore().collection('users').doc(currentUserId).get();
    if (!currentUserDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = currentUserDoc.data();
    const { preferences, gender, dateOfBirth } = currentUser;

    // Calculate age range
    const currentAge = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    const minAge = preferences?.ageRange?.min || 18;
    const maxAge = preferences?.ageRange?.max || 50;

    // Build query for potential matches
    let query = admin.firestore().collection('users')
      .where('isProfileComplete', '==', true)
      .where('uid', '!=', currentUserId);

    // Filter by gender preference
    if (preferences?.gender && preferences.gender.length > 0) {
      query = query.where('gender', 'in', preferences.gender);
    }

    const snapshot = await query.limit(parseInt(limit)).get();
    let potentialMatches = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Calculate user's age
      const userAge = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();
      
      // Check age range
      if (userAge < minAge || userAge > maxAge) continue;

      // Check if user is interested in current user's gender
      if (userData.preferences?.gender && userData.preferences.gender.length > 0) {
        if (!userData.preferences.gender.includes(gender)) continue;
      }

      // Calculate distance if location is provided
      if (latitude && longitude && userData.location) {
        const distanceInKm = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          userData.location.latitude,
          userData.location.longitude
        );

        if (distanceInKm > distance) continue;
        userData.distance = Math.round(distanceInKm);
      }

      // Check if there's already a match or like
      const existingMatch = await checkExistingInteraction(currentUserId, userData.uid);
      if (existingMatch) continue;

      potentialMatches.push({
        uid: userData.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userAge,
        bio: userData.bio,
        photos: userData.photos,
        interests: userData.interests,
        location: userData.location,
        distance: userData.distance,
        isVerified: userData.isVerified
      });
    }

    // Sort by distance if available
    potentialMatches.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    res.json({
      matches: potentialMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: potentialMatches.length
      }
    });

  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to fetch potential matches' });
  }
});

// Get user profile by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uid;

    // Don't allow users to view their own profile through this endpoint
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot view own profile through this endpoint' });
    }

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Calculate age
    const age = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();

    // Remove sensitive information
    const publicProfile = {
      uid: userData.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      age,
      bio: userData.bio,
      photos: userData.photos,
      interests: userData.interests,
      isVerified: userData.isVerified,
      location: userData.location
    };

    res.json({ user: publicProfile });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user location
router.put('/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const currentUserId = req.user.uid;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    await admin.firestore().collection('users').doc(currentUserId).update({
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Location updated successfully' });

  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Search users by interests or name
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.uid;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Search in Firestore (note: Firestore doesn't support full-text search)
    // This is a simple implementation - for production, consider using Algolia or similar
    const snapshot = await admin.firestore().collection('users')
      .where('isProfileComplete', '==', true)
      .where('uid', '!=', currentUserId)
      .limit(parseInt(limit))
      .get();

    const searchResults = [];
    const searchTerm = query.toLowerCase();

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      
      // Check if query matches name or interests
      const firstName = userData.firstName?.toLowerCase() || '';
      const lastName = userData.lastName?.toLowerCase() || '';
      const interests = userData.interests?.join(' ').toLowerCase() || '';
      const bio = userData.bio?.toLowerCase() || '';

      if (firstName.includes(searchTerm) || 
          lastName.includes(searchTerm) || 
          interests.includes(searchTerm) ||
          bio.includes(searchTerm)) {
        
        const age = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();
        
        searchResults.push({
          uid: userData.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          age,
          bio: userData.bio,
          photos: userData.photos,
          interests: userData.interests,
          isVerified: userData.isVerified
        });
      }
    }

    res.json({
      results: searchResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: searchResults.length
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to check existing interactions
async function checkExistingInteraction(userId1, userId2) {
  try {
    // Check for existing likes
    const likeDoc = await admin.firestore()
      .collection('likes')
      .doc(`${userId1}_${userId2}`)
      .get();

    if (likeDoc.exists) return true;

    // Check for existing matches
    const matchDoc = await admin.firestore()
      .collection('matches')
      .where('users', 'array-contains', userId1)
      .where('users', 'array-contains', userId2)
      .get();

    return !matchDoc.empty;
  } catch (error) {
    console.error('Check interaction error:', error);
    return false;
  }
}

module.exports = router;
