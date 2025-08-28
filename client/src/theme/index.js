import { DefaultTheme, DarkTheme } from 'react-native-paper';

// Custom colors for Pwani Love
const colors = {
  primary: '#FF6B9D', // Pink - main brand color
  secondary: '#4ECDC4', // Teal - accent color
  accent: '#FFE66D', // Yellow - highlight color
  background: '#FFFFFF',
  surface: '#F8F9FA',
  error: '#FF5252',
  text: '#1A1A1A',
  disabled: '#BDBDBD',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF6B9D',
  border: '#E0E0E0',
  card: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  // Dating app specific colors
  like: '#FF6B9D',
  dislike: '#FF5252',
  superlike: '#4ECDC4',
  match: '#FFE66D',
  online: '#4CAF50',
  offline: '#9E9E9E',
  verified: '#2196F3',
  premium: '#FFD700',
};

const darkColors = {
  primary: '#FF6B9D',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#FF5252',
  text: '#FFFFFF',
  disabled: '#757575',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  notification: '#FF6B9D',
  border: '#2C2C2C',
  card: '#1E1E1E',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  // Dating app specific colors
  like: '#FF6B9D',
  dislike: '#FF5252',
  superlike: '#4ECDC4',
  match: '#FFE66D',
  online: '#4CAF50',
  offline: '#757575',
  verified: '#2196F3',
  premium: '#FFD700',
};

// Typography
const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  light: 'Poppins-Light',
};

const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
  full: 9999,
};

// Shadows
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Animation
const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Create light theme
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
  animation,
  // Custom properties
  isDark: false,
  statusBar: 'dark-content',
};

// Create dark theme
export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...darkColors,
  },
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
  animation,
  // Custom properties
  isDark: true,
  statusBar: 'light-content',
};

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outline: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  text: {
    h1: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xxxl,
      color: colors.text,
    },
    h2: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xxl,
      color: colors.text,
    },
    h3: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.text,
    },
    caption: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.placeholder,
    },
    button: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.text,
    },
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    fontFamily: fonts.regular,
    backgroundColor: colors.surface,
  },
  avatar: {
    small: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.round,
    },
    medium: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.round,
    },
    large: {
      width: 100,
      height: 100,
      borderRadius: borderRadius.round,
    },
    xlarge: {
      width: 150,
      height: 150,
      borderRadius: borderRadius.round,
    },
  },
};

// Gradient colors for dating app
export const gradients = {
  primary: ['#FF6B9D', '#FF8EAB'],
  secondary: ['#4ECDC4', '#6EE7DF'],
  accent: ['#FFE66D', '#FFF176'],
  sunset: ['#FF6B9D', '#FFE66D'],
  ocean: ['#4ECDC4', '#2196F3'],
  fire: ['#FF5252', '#FF9800'],
  match: ['#FF6B9D', '#4ECDC4'],
};

export default {
  lightTheme,
  darkTheme,
  commonStyles,
  gradients,
};
