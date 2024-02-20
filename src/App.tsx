/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from 'react-redux';
import { setupStore } from './stores/redux/store';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import AppStack from './app-stack';

const linking = {
  prefixes: [
    // your linking prefixes
    'h2o://',
  ],
  config: {
    // configuration for matching screens with paths
    screens: {
      Home: 'Home',
    },
  },
};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

const App = (): JSX.Element => {
  return (
    <NavigationContainer linking={linking}>
      <StoreProvider store={setupStore({})}>
        <PaperProvider theme={theme}>
          <AppStack />
        </PaperProvider>
      </StoreProvider>
    </NavigationContainer>
  );
};

export default App;
