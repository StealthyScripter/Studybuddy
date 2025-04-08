// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import StudyScreen from '../screens/StudyScreen';
import QuizScreen from '../screens/QuizScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FileDetailsScreen from '../screens/FileDetailsScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
import DiscussionScreen from '../screens/DiscussionScreen';
import QuizResultsScreen from '../screens/QuizResultsScreen';
import PerformanceScreen from '../screens/PerformanceScreen';

// Import theme
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Library Stack
const LibraryStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="LibraryList" 
        component={LibraryScreen} 
        options={{ title: 'My Library' }} 
      />
      <Stack.Screen 
        name="FileDetails" 
        component={FileDetailsScreen} 
        options={({ route }) => ({ title: route.params?.fileName || 'File Details' })} 
      />
      <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ title: 'Audio Book' }} />
      <Stack.Screen name="Discussion" component={DiscussionScreen} options={{ title: 'Discussion' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} options={{ title: 'Quiz Results' }} />
      <Stack.Screen name="Performance" component={PerformanceScreen} options={{ title: 'Performance' }} />
    </Stack.Navigator>
  );
};

// Study Stack
const StudyStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="StudyHome" component={StudyScreen} options={{ title: 'Study' }} />
      <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ title: 'Audio Book' }} />
      <Stack.Screen name="Discussion" component={DiscussionScreen} options={{ title: 'Discussion' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} options={{ title: 'Quiz Results' }} />
      <Stack.Screen name="Performance" component={PerformanceScreen} options={{ title: 'Performance' }} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const AppNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Library" 
          component={LibraryStack} 
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bookshelf" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Study" 
          component={StudyStack} 
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;