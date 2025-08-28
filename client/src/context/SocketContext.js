import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && token) {
      const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(() => {
            newSocket.connect();
          }, 1000 * reconnectAttempts.current);
        }
      });

      // User events
      newSocket.on('user_online', (userId) => {
        setOnlineUsers(prev => {
          if (!prev.includes(userId)) {
            return [...prev, userId];
          }
          return prev;
        });
      });

      newSocket.on('user_offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      // Chat events
      newSocket.on('message_received', (data) => {
        // Handle new message received
        console.log('New message received:', data);
      });

      newSocket.on('message_sent', (data) => {
        // Handle message sent confirmation
        console.log('Message sent:', data);
      });

      newSocket.on('typing_start', (data) => {
        const { matchId, userId } = data;
        setTypingUsers(prev => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), userId]
        }));
      });

      newSocket.on('typing_stop', (data) => {
        const { matchId, userId } = data;
        setTypingUsers(prev => ({
          ...prev,
          [matchId]: (prev[matchId] || []).filter(id => id !== userId)
        }));
      });

      // Match events
      newSocket.on('new_match', (data) => {
        // Handle new match
        console.log('New match:', data);
      });

      newSocket.on('like_received', (data) => {
        // Handle like received
        console.log('Like received:', data);
      });

      newSocket.on('superlike_received', (data) => {
        // Handle super like received
        console.log('Super like received:', data);
      });

      // Notification events
      newSocket.on('notification', (data) => {
        // Handle push notification
        console.log('Notification received:', data);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user, token]);

  // Join match room
  const joinMatchRoom = (matchId) => {
    if (socket && isConnected) {
      socket.emit('join_match', { matchId });
    }
  };

  // Leave match room
  const leaveMatchRoom = (matchId) => {
    if (socket && isConnected) {
      socket.emit('leave_match', { matchId });
    }
  };

  // Send message
  const sendMessage = (matchId, message, type = 'text') => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        matchId,
        message,
        type,
        timestamp: Date.now()
      });
    }
  };

  // Start typing
  const startTyping = (matchId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { matchId });
    }
  };

  // Stop typing
  const stopTyping = (matchId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { matchId });
    }
  };

  // Send like
  const sendLike = (userId) => {
    if (socket && isConnected) {
      socket.emit('send_like', { userId });
    }
  };

  // Send super like
  const sendSuperLike = (userId) => {
    if (socket && isConnected) {
      socket.emit('send_superlike', { userId });
    }
  };

  // Send dislike
  const sendDislike = (userId) => {
    if (socket && isConnected) {
      socket.emit('send_dislike', { userId });
    }
  };

  // Update user status
  const updateStatus = (status) => {
    if (socket && isConnected) {
      socket.emit('update_status', { status });
    }
  };

  // Update user location
  const updateLocation = (latitude, longitude) => {
    if (socket && isConnected) {
      socket.emit('update_location', { latitude, longitude });
    }
  };

  // Get online status of user
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Get typing users for a match
  const getTypingUsers = (matchId) => {
    return typingUsers[matchId] || [];
  };

  // Check if user is typing in a match
  const isUserTyping = (matchId, userId) => {
    return (typingUsers[matchId] || []).includes(userId);
  };

  // Listen to specific events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Remove event listener
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  // Emit custom event
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  // Context value
  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinMatchRoom,
    leaveMatchRoom,
    sendMessage,
    startTyping,
    stopTyping,
    sendLike,
    sendSuperLike,
    sendDislike,
    updateStatus,
    updateLocation,
    isUserOnline,
    getTypingUsers,
    isUserTyping,
    on,
    off,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
