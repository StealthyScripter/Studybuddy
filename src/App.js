import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './context/ThemeContext';
import { initializeFileStorage } from './services/fileService';

// Ignore specific warnings for development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Initialize app data and services
    const setupApp = async () => {
      try {
        // Initialize file storage
        await initializeFileStorage();
        
        // Any other initialization tasks would go here
        
        setAppReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    setupApp();
  }, []);
  
  if (!appReady) {
    // Show loading screen or splash screen
    return null;
  }
  
  return (
    <ThemeProvider>
      <PaperProvider>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <AppNavigator />
      </PaperProvider>
    </ThemeProvider>
  );
};

export default App;