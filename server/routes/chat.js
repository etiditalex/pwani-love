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

// Get chat messages for a specific match
router.get('/:matchId', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.uid;

    // Verify user is part of this match
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const matchData = matchDoc.data();
    if (!matchData.users.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    // Get messages from Firebase Realtime Database
    const messagesRef = admin.database().ref(`chats/${matchId}/messages`);
    const snapshot = await messagesRef
      .orderByChild('timestamp')
      .limitToLast(parseInt(limit))
      .once('value');

    const messages = [];
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      messages.push({
        id: childSnapshot.key,
        ...message
      });
    });

    // Mark messages as read
    await markMessagesAsRead(matchId, currentUserId);

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/:matchId', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { message, type = 'text' } = req.body;
    const currentUserId = req.user.uid;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Verify user is part of this match
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const matchData = matchDoc.data();
    if (!matchData.users.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to send messages to this chat' });
    }

    // Get sender's profile
    const senderDoc = await admin.firestore().collection('users').doc(currentUserId).get();
    if (!senderDoc.exists) {
      return res.status(404).json({ error: 'Sender profile not found' });
    }

    const senderData = senderDoc.data();
    const otherUserId = matchData.users.find(id => id !== currentUserId);

    // Create message object
    const messageData = {
      senderId: currentUserId,
      senderName: `${senderData.firstName} ${senderData.lastName}`,
      message: message.trim(),
      type,
      timestamp: Date.now(),
      isRead: false
    };

    // Save message to Firebase Realtime Database
    const messagesRef = admin.database().ref(`chats/${matchId}/messages`);
    const newMessageRef = await messagesRef.push(messageData);

    // Update match with last message
    await admin.firestore().collection('matches').doc(matchId).update({
      lastMessage: {
        text: message.trim(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        senderId: currentUserId
      },
      unreadCount: {
        ...matchData.unreadCount,
        [otherUserId]: (matchData.unreadCount[otherUserId] || 0) + 1
      }
    });

    // Send push notification to the other user
    await sendMessageNotification(otherUserId, senderData.firstName, message.trim());

    res.json({
      message: 'Message sent successfully',
      messageId: newMessageRef.key,
      messageData: {
        id: newMessageRef.key,
        ...messageData
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/:matchId/read', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = req.user.uid;

    // Verify user is part of this match
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const matchData = matchDoc.data();
    if (!matchData.users.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }

    await markMessagesAsRead(matchId, currentUserId);

    // Reset unread count for this user
    await admin.firestore().collection('matches').doc(matchId).update({
      [`unreadCount.${currentUserId}`]: 0
    });

    res.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Delete a message
router.delete('/:matchId/:messageId', authenticateToken, async (req, res) => {
  try {
    const { matchId, messageId } = req.params;
    const currentUserId = req.user.uid;

    // Verify user is part of this match
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const matchData = matchDoc.data();
    if (!matchData.users.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to delete messages from this chat' });
    }

    // Get the message to verify ownership
    const messageRef = admin.database().ref(`chats/${matchId}/messages/${messageId}`);
    const messageSnapshot = await messageRef.once('value');
    
    if (!messageSnapshot.exists()) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const messageData = messageSnapshot.val();
    if (messageData.senderId !== currentUserId) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    // Delete the message
    await messageRef.remove();

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get unread message count for all matches
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.uid;

    // Get all matches for the current user
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('users', 'array-contains', currentUserId)
      .get();

    let totalUnread = 0;
    const unreadByMatch = {};

    for (const matchDoc of matchesSnapshot.docs) {
      const matchData = matchDoc.data();
      const unreadCount = matchData.unreadCount?.[currentUserId] || 0;
      
      if (unreadCount > 0) {
        totalUnread += unreadCount;
        unreadByMatch[matchDoc.id] = unreadCount;
      }
    }

    res.json({
      totalUnread,
      unreadByMatch
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Send typing indicator
router.post('/:matchId/typing', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { isTyping } = req.body;
    const currentUserId = req.user.uid;

    // Verify user is part of this match
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const matchData = matchDoc.data();
    if (!matchData.users.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }

    // Update typing status in Firebase Realtime Database
    const typingRef = admin.database().ref(`chats/${matchId}/typing/${currentUserId}`);
    if (isTyping) {
      await typingRef.set({
        isTyping: true,
        timestamp: Date.now()
      });
    } else {
      await typingRef.remove();
    }

    res.json({ message: 'Typing status updated' });

  } catch (error) {
    console.error('Typing indicator error:', error);
    res.status(500).json({ error: 'Failed to update typing status' });
  }
});

// Helper function to mark messages as read
async function markMessagesAsRead(matchId, userId) {
  try {
    const messagesRef = admin.database().ref(`chats/${matchId}/messages`);
    const snapshot = await messagesRef
      .orderByChild('timestamp')
      .once('value');

    const updates = {};
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      if (message.senderId !== userId && !message.isRead) {
        updates[`${childSnapshot.key}/isRead`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await messagesRef.update(updates);
    }
  } catch (error) {
    console.error('Mark messages as read error:', error);
  }
}

// Helper function to send message notification
async function sendMessageNotification(userId, senderName, message) {
  try {
    await admin.firestore().collection('notifications').add({
      userId,
      type: 'message',
      title: `New message from ${senderName}`,
      message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: {
        senderName,
        message
      },
      isRead: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Send message notification error:', error);
  }
}

module.exports = router;
