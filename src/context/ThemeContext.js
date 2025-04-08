import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../themes/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState('auto');
  const [activeColors, setActiveColors] = useState(colors.light);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme', error);
      }
    };
    
    loadTheme();
  }, []);

  useEffect(() => {
    // Update colors based on theme setting
    if (theme === 'auto') {
      setActiveColors(deviceTheme === 'dark' ? colors.dark : colors.light);
    } else {
      setActiveColors(theme === 'dark' ? colors.dark : colors.light);
    }
  }, [theme, deviceTheme]);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      await AsyncStorage.setItem('userTheme', newTheme);
    } catch (error) {
      console.log('Error saving theme', error);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      setTheme(mode);
      await AsyncStorage.setItem('userTheme', mode);
    } catch (error) {
      console.log('Error saving theme', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors: activeColors, theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);