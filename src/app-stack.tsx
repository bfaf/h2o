import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings, History, Caluclator } from './screens';
import CustomNavigationBar from './components/custom-nav-bar';
import { useAppState, useInitValues, useNotificationBackgroundService, useNotificationFrontendService } from './utils/hooks';
import { useSelector } from 'react-redux';
import { daylyConsumption } from './stores/redux/slices/daylyConsumptionSlice';
import { settings } from './stores/redux/slices/settingSlice';
import { ActivityIndicator } from 'react-native-paper';
import { Alert, View } from 'react-native';

const Stack = createNativeStackNavigator();

const AppStack = (): JSX.Element => {
    useAppState();
    useInitValues();
    useNotificationFrontendService();
    useNotificationBackgroundService();

    const {
        dailyDataIsLoading,
        dailyConsumptionErrors,
    } = useSelector(daylyConsumption);
    const {
        settingsDataIsLoading,
        settingsErrors
    } = useSelector(settings);

    useEffect(() => {
        if (settingsErrors.length) {
            Alert.alert(
                'Errors Detected',
                `Error(s) while loading the settings: ${settingsErrors}. Will load default settings`,
                [
                    {
                        text: "OK",
                        onPress: () => { },
                        style: "cancel"
                    },
                ],
                { cancelable: false }
            );
        }
        else if (dailyConsumptionErrors.length) {
            Alert.alert(
                'Errors Detected',
                `Error(s) while updating data: ${settingsErrors}.`,
                [
                    {
                        text: "OK",
                        onPress: () => { },
                        style: "cancel"
                    },
                ],
                { cancelable: false }
            );
        }
    }, [settingsErrors, dailyConsumptionErrors]);

    if (dailyDataIsLoading || settingsDataIsLoading) {
        return (
            <View style={{ flex: 1, marginVertical: 'auto', justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        );
    }

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
