import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings, History, Caluclator } from './screens';
import CustomNavigationBar from './components/custom-nav-bar';
import { useAppState, useInitValues, useNotificationBackgroundService, useNotificationFrontendService } from './utils/hooks';

const Stack = createNativeStackNavigator();

const AppStack = (): JSX.Element => {
    useAppState();
    useInitValues();
    useNotificationFrontendService();
    useNotificationBackgroundService();

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
            <Stack.Screen
                name="Calculator"
                component={Caluclator}
            />
        </Stack.Navigator>
    );
};

export default AppStack;
