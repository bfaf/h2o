/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './stores/redux/store';
import { Home, Settings, History } from './screens';
import { PaperProvider } from 'react-native-paper';
import CustomNavigationBar from './components/custom-nav-bar';

const Stack = createNativeStackNavigator();

const App = (): JSX.Element => {
  return (
    <NavigationContainer>
      <StoreProvider store={store}>
        <PaperProvider>
          <Stack.Navigator initialRouteName="Home" screenOptions={{
            headerBackVisible: true,
            header: (props) => <CustomNavigationBar {...props} />,
          }}>
            <Stack.Screen
              name="Home"
              component={Home}
            />
            <Stack.Screen
              name="Settings"
              component={Settings}
            />
            <Stack.Screen
              name="History"
              component={History}
            />
          </Stack.Navigator>
        </PaperProvider>
      </StoreProvider>
    </NavigationContainer>
  );
}

export default App;
