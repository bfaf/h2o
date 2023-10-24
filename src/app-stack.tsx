import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings, History } from './screens';
import CustomNavigationBar from './components/custom-nav-bar';

const Stack = createNativeStackNavigator();

const AppStack = (): JSX.Element => {
    return (
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
    );
};

export default AppStack;
