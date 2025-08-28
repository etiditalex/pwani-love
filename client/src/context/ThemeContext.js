import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children, value }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(value.theme);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
          setTheme(isDark ? value.theme : value.theme); // This will be updated by the parent
        } else {
          // Use system preference as default
          const systemIsDark = systemColorScheme === 'dark';
          setIsDarkMode(systemIsDark);
          setTheme(systemIsDark ? value.theme : value.theme); // This will be updated by the parent
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to system preference
        const systemIsDark = systemColorScheme === 'dark';
        setIsDarkMode(systemIsDark);
        setTheme(systemIsDark ? value.theme : value.theme); // This will be updated by the parent
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Toggle theme
  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);
      
      // Save preference
      await AsyncStorage.setItem('themePreference', newIsDarkMode ? 'dark' : 'light');
      
      // Update theme (this will be handled by the parent component)
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Set specific theme
  const setThemeMode = async (mode) => {
    try {
      const isDark = mode === 'dark';
      setIsDarkMode(isDark);
      
      // Save preference
      await AsyncStorage.setItem('themePreference', mode);
      
      // Update theme (this will be handled by the parent component)
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Get theme mode string
  const getThemeMode = () => {
    return isDarkMode ? 'dark' : 'light';
  };

  // Check if theme is dark
  const isDark = () => {
    return isDarkMode;
  };

  // Check if theme is light
  const isLight = () => {
    return !isDarkMode;
  };

  // Get theme colors
  const getColors = () => {
    return theme.colors;
  };

  // Get theme fonts
  const getFonts = () => {
    return theme.fonts;
  };

  // Get theme spacing
  const getSpacing = () => {
    return theme.spacing;
  };

  // Get theme border radius
  const getBorderRadius = () => {
    return theme.borderRadius;
  };

  // Get theme shadows
  const getShadows = () => {
    return theme.shadows;
  };

  // Get theme animation
  const getAnimation = () => {
    return theme.animation;
  };

  // Get theme font sizes
  const getFontSizes = () => {
    return theme.fontSizes;
  };

  // Get theme font weights
  const getFontWeights = () => {
    return theme.fontWeights;
  };

  // Context value
  const contextValue = {
    theme,
    isDarkMode,
    toggleTheme,
    setThemeMode,
    getThemeMode,
    isDark,
    isLight,
    getColors,
    getFonts,
    getSpacing,
    getBorderRadius,
    getShadows,
    getAnimation,
    getFontSizes,
    getFontWeights,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
