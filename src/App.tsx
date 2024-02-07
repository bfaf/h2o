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
import { PaperProvider } from 'react-native-paper';
import AppStack from './app-stack';

const linking = {
  prefixes: [
    // your linking prefixes 
    'h2o://'
  ],
  config: {
    // configuration for matching screens with paths 
    screens: {
      Home: 'Home',
    }
  },
};

const App = (): JSX.Element => {
  return (
    <NavigationContainer>
      <StoreProvider store={setupStore({})}>
        <PaperProvider>
          <AppStack />
        </PaperProvider>
      </StoreProvider>
    </NavigationContainer>
  );
}

export default App;
