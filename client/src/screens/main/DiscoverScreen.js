import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;
const SWIPE_THRESHOLD = 120;

const DiscoverScreen = () => {
  const { theme } = useTheme();
  const { user, apiRequest } = useAuth();
  const { sendLike, sendSuperLike, sendDislike } = useSocket();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  // Fetch potential matches
  const { data: potentialMatches, isLoading, error, refetch } = useQuery(
    ['potentialMatches', userLocation],
    async () => {
      if (!userLocation) return { matches: [] };
      
      const response = await apiRequest('/users/discover', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          distance: 50,
          limit: 20
        }
      });
      return response;
    },
    {
      enabled: !!userLocation,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Like mutation
  const likeMutation = useMutation(
    async (userId) => {
      const response = await apiRequest(`/matches/like/${userId}`, {
        method: 'POST'
      });
      return response;
    },
    {
      onSuccess: (data, userId) => {
        if (data.isMatch) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('It\'s a Match! 🎉', `You matched with someone!`);
        }
        removeCard();
      },
      onError: (error) => {
        console.error('Like error:', error);
        Alert.alert('Error', 'Failed to like user');
      }
    }
  );

  // Dislike mutation
  const dislikeMutation = useMutation(
    async (userId) => {
      const response = await apiRequest(`/matches/dislike/${userId}`, {
        method: 'POST'
      });
      return response;
    },
    {
      onSuccess: () => {
        removeCard();
      },
      onError: (error) => {
        console.error('Dislike error:', error);
        Alert.alert('Error', 'Failed to dislike user');
      }
    }
  );

  // Super like mutation
  const superLikeMutation = useMutation(
    async (userId) => {
      const response = await apiRequest(`/matches/superlike/${userId}`, {
        method: 'POST'
      });
      return response;
    },
    {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Super Like Sent! ⭐', 'They\'ll be notified of your super like!');
        removeCard();
      },
      onError: (error) => {
        console.error('Super like error:', error);
        Alert.alert('Error', 'Failed to send super like');
      }
    }
  );

  // Get user location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Update profiles when potential matches change
  useEffect(() => {
    if (potentialMatches?.matches) {
      setProfiles(potentialMatches.matches);
    }
  }, [potentialMatches]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find matches');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get your location');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const removeCard = () => {
    setCurrentIndex(prev => prev + 1);
    resetCardPosition();
  };

  const resetCardPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(rotate, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = () => {
    if (profiles[currentIndex]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      likeMutation.mutate(profiles[currentIndex].uid);
      sendLike(profiles[currentIndex].uid);
    }
  };

  const handleDislike = () => {
    if (profiles[currentIndex]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dislikeMutation.mutate(profiles[currentIndex].uid);
      sendDislike(profiles[currentIndex].uid);
    }
  };

  const handleSuperLike = () => {
    if (profiles[currentIndex]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      superLikeMutation.mutate(profiles[currentIndex].uid);
      sendSuperLike(profiles[currentIndex].uid);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, translationY } = event.nativeEvent;

      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? 1 : -1;
        const toValue = direction * width * 1.5;

        Animated.parallel([
          Animated.timing(translateX, {
            toValue,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: direction * 0.3,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (direction > 0) {
            handleLike();
          } else {
            handleDislike();
          }
        });
      } else {
        resetCardPosition();
      }
    }
  };

  const renderCard = (profile, index) => {
    if (index < currentIndex) return null;

    const isFirst = index === currentIndex;
    const panHandlers = isFirst ? { onGestureEvent, onHandlerStateChange } : {};

    const cardStyle = {
      transform: isFirst
        ? [
            { translateX },
            { translateY },
            { scale },
            {
              rotate: rotate.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ['-30deg', '0deg', '30deg'],
              }),
            },
          ]
        : [
            {
              scale: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
    };

    const age = profile.dateOfBirth 
      ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()
      : 'N/A';

    return (
      <PanGestureHandler key={profile.uid} {...panHandlers}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Image
            source={{ uri: profile.photos?.[0] || 'https://via.placeholder.com/400x600' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardOverlay}
          >
            <View style={styles.cardContent}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {profile.firstName}, {age}
                </Text>
                {profile.isVerified && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.verified} />
                )}
              </View>
              
              {profile.bio && (
                <Text style={styles.userBio} numberOfLines={2}>
                  {profile.bio}
                </Text>
              )}
              
              {profile.distance && (
                <Text style={styles.userDistance}>
                  {Math.round(profile.distance)} km away
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* Like/Dislike indicators */}
          {isFirst && (
            <>
              <Animated.View
                style={[
                  styles.likeIndicator,
                  {
                    opacity: translateX.interpolate({
                      inputRange: [0, SWIPE_THRESHOLD],
                      outputRange: [0, 1],
                    }),
                  },
                ]}
              >
                <Text style={styles.likeText}>LIKE</Text>
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.dislikeIndicator,
                  {
                    opacity: translateX.interpolate({
                      inputRange: [-SWIPE_THRESHOLD, 0],
                      outputRange: [1, 0],
                    }),
                  },
                ]}
              >
                <Text style={styles.dislikeText}>NOPE</Text>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={theme.colors.placeholder} />
      <Text style={styles.emptyTitle}>No more profiles</Text>
      <Text style={styles.emptySubtitle}>
        Check back later for new matches in your area
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Finding matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load profiles</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Discover
        </Text>
        <TouchableOpacity onPress={getCurrentLocation}>
          <Ionicons name="location" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {profiles.length > 0 && currentIndex < profiles.length ? (
          profiles.map((profile, index) => renderCard(profile, index))
        ) : (
          renderEmptyState()
        )}
      </View>

      {profiles.length > 0 && currentIndex < profiles.length && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={handleDislike}
            disabled={likeMutation.isLoading || dislikeMutation.isLoading}
          >
            <Ionicons name="close" size={30} color={theme.colors.dislike} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={handleSuperLike}
            disabled={superLikeMutation.isLoading}
          >
            <Ionicons name="star" size={30} color={theme.colors.superlike} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
            disabled={likeMutation.isLoading || dislikeMutation.isLoading}
          >
            <Ionicons name="heart" size={30} color={theme.colors.like} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  userDistance: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    transform: [{ rotate: '15deg' }],
    borderWidth: 4,
    borderColor: '#4CAF50',
    padding: 10,
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dislikeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 4,
    borderColor: '#FF5252',
    padding: 10,
  },
  dislikeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#fff',
  },
  superLikeButton: {
    backgroundColor: '#fff',
  },
  likeButton: {
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  refreshButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 18,
    color: '#FF5252',
    marginBottom: 20,
  },
});

export default DiscoverScreen;
