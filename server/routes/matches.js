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

// Like a user
router.post('/like/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uid;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot like yourself' });
    }

    // Check if user exists
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already liked
    const existingLike = await admin.firestore()
      .collection('likes')
      .doc(`${currentUserId}_${userId}`)
      .get();

    if (existingLike.exists) {
      return res.status(400).json({ error: 'Already liked this user' });
    }

    // Create like record
    await admin.firestore()
      .collection('likes')
      .doc(`${currentUserId}_${userId}`)
      .set({
        fromUser: currentUserId,
        toUser: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    // Check if it's a mutual like (match)
    const mutualLike = await admin.firestore()
      .collection('likes')
      .doc(`${userId}_${currentUserId}`)
      .get();

    if (mutualLike.exists) {
      // Create match
      const matchData = {
        users: [currentUserId, userId],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        lastMessage: null,
        unreadCount: { [currentUserId]: 0, [userId]: 0 }
      };

      const matchRef = await admin.firestore().collection('matches').add(matchData);

      // Send notification to both users
      await sendMatchNotification(currentUserId, userId, matchRef.id);
      await sendMatchNotification(userId, currentUserId, matchRef.id);

      res.json({
        message: 'It\'s a match!',
        isMatch: true,
        matchId: matchRef.id
      });
    } else {
      res.json({
        message: 'Like sent successfully',
        isMatch: false
      });
    }

  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like user' });
  }
});

// Dislike a user
router.post('/dislike/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uid;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot dislike yourself' });
    }

    // Remove any existing like
    await admin.firestore()
      .collection('likes')
      .doc(`${currentUserId}_${userId}`)
      .delete();

    // Create dislike record (optional - for analytics)
    await admin.firestore()
      .collection('dislikes')
      .doc(`${currentUserId}_${userId}`)
      .set({
        fromUser: currentUserId,
        toUser: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ message: 'Dislike recorded successfully' });

  } catch (error) {
    console.error('Dislike error:', error);
    res.status(500).json({ error: 'Failed to dislike user' });
  }
});

// Get user's matches
router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.uid;

    // Get all matches for the current user
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('users', 'array-contains', currentUserId)
      .orderBy('timestamp', 'desc')
      .get();

    const matches = [];

    for (const matchDoc of matchesSnapshot.docs) {
      const matchData = matchDoc.data();
      const otherUserId = matchData.users.find(id => id !== currentUserId);

      // Get the other user's profile
      const otherUserDoc = await admin.firestore().collection('users').doc(otherUserId).get();
      if (!otherUserDoc.exists) continue;

      const otherUser = otherUserDoc.data();
      const age = new Date().getFullYear() - new Date(otherUser.dateOfBirth).getFullYear();

      matches.push({
        matchId: matchDoc.id,
        user: {
          uid: otherUser.uid,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          age,
          photos: otherUser.photos,
          bio: otherUser.bio,
          isVerified: otherUser.isVerified
        },
        lastMessage: matchData.lastMessage,
        unreadCount: matchData.unreadCount[currentUserId] || 0,
        timestamp: matchData.timestamp
      });
    }

    res.json({ matches });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get user's likes (who liked them)
router.get('/likes', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.uid;

    // Get all likes received by the current user
    const likesSnapshot = await admin.firestore()
      .collection('likes')
      .where('toUser', '==', currentUserId)
      .orderBy('timestamp', 'desc')
      .get();

    const likes = [];

    for (const likeDoc of likesSnapshot.docs) {
      const likeData = likeDoc.data();
      const fromUserId = likeData.fromUser;

      // Check if current user has also liked them (mutual like)
      const mutualLike = await admin.firestore()
        .collection('likes')
        .doc(`${currentUserId}_${fromUserId}`)
        .get();

      if (mutualLike.exists) continue; // Skip if already matched

      // Get the user's profile who liked them
      const userDoc = await admin.firestore().collection('users').doc(fromUserId).get();
      if (!userDoc.exists) continue;

      const userData = userDoc.data();
      const age = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();

      likes.push({
        likeId: likeDoc.id,
        user: {
          uid: userData.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          age,
          photos: userData.photos,
          bio: userData.bio,
          isVerified: userData.isVerified
        },
        timestamp: likeData.timestamp
      });
    }

    res.json({ likes });

  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// Super like a user (premium feature)
router.post('/superlike/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uid;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot super like yourself' });
    }

    // Check if user exists
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create super like record
    await admin.firestore()
      .collection('superlikes')
      .doc(`${currentUserId}_${userId}`)
      .set({
        fromUser: currentUserId,
        toUser: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    // Send super like notification
    await sendSuperLikeNotification(currentUserId, userId);

    res.json({ message: 'Super like sent successfully' });

  } catch (error) {
    console.error('Super like error:', error);
    res.status(500).json({ error: 'Failed to super like user' });
  }
});

// Get user's super likes received
router.get('/superlikes', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.uid;

    const superLikesSnapshot = await admin.firestore()
      .collection('superlikes')
      .where('toUser', '==', currentUserId)
      .orderBy('timestamp', 'desc')
      .get();

    const superLikes = [];

    for (const superLikeDoc of superLikesSnapshot.docs) {
      const superLikeData = superLikeDoc.data();
      const fromUserId = superLikeData.fromUser;

      const userDoc = await admin.firestore().collection('users').doc(fromUserId).get();
      if (!userDoc.exists) continue;

      const userData = userDoc.data();
      const age = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();

      superLikes.push({
        superLikeId: superLikeDoc.id,
        user: {
          uid: userData.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          age,
          photos: userData.photos,
          bio: userData.bio,
          isVerified: userData.isVerified
        },
        timestamp: superLikeData.timestamp
      });
    }

    res.json({ superLikes });

  } catch (error) {
    console.error('Get super likes error:', error);
    res.status(500).json({ error: 'Failed to fetch super likes' });
  }
});

// Helper function to send match notification
async function sendMatchNotification(userId1, userId2, matchId) {
  try {
    // Get user profiles
    const user1Doc = await admin.firestore().collection('users').doc(userId1).get();
    const user2Doc = await admin.firestore().collection('users').doc(userId2).get();

    if (!user1Doc.exists || !user2Doc.exists) return;

    const user1 = user1Doc.data();
    const user2 = user2Doc.data();

    // Create notification
    await admin.firestore().collection('notifications').add({
      userId: userId2,
      type: 'match',
      title: 'New Match!',
      message: `You matched with ${user1.firstName}!`,
      data: {
        matchId,
        matchedUserId: userId1,
        matchedUserName: `${user1.firstName} ${user1.lastName}`
      },
      isRead: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Send match notification error:', error);
  }
}

// Helper function to send super like notification
async function sendSuperLikeNotification(fromUserId, toUserId) {
  try {
    const fromUserDoc = await admin.firestore().collection('users').doc(fromUserId).get();
    if (!fromUserDoc.exists) return;

    const fromUser = fromUserDoc.data();

    await admin.firestore().collection('notifications').add({
      userId: toUserId,
      type: 'superlike',
      title: 'Super Like!',
      message: `${fromUser.firstName} super liked you!`,
      data: {
        fromUserId,
        fromUserName: `${fromUser.firstName} ${fromUser.lastName}`
      },
      isRead: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Send super like notification error:', error);
  }
}

module.exports = router;
