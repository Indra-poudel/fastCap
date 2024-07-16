// By some reason this show error on import @navigation

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
