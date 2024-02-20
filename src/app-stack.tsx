import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings, History, Caluclator } from './screens';
import CustomNavigationBar from './components/custom-nav-bar';
import {
  useAppState,
  useInitValues,
  useNotificationBackgroundService,
  useNotificationFrontendService,
} from './utils/hooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearDaylyConsumptionErrors,
  daylyConsumption,
} from './stores/redux/slices/daylyConsumptionSlice';
import { clearSettingsErrors, settings } from './stores/redux/slices/settingSlice';
import { ActivityIndicator } from 'react-native-paper';
import { Alert, View } from 'react-native';
import { type AppDispatch } from './stores/redux/store';

const Stack = createNativeStackNavigator();

const AppStack = (): React.JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  useAppState();
  useInitValues();
  useNotificationFrontendService();
  useNotificationBackgroundService();

  const { dailyDataIsLoading, dailyConsumptionErrors } = useSelector(daylyConsumption);
  const { settingsDataIsLoading, settingsErrors } = useSelector(settings);

  useEffect(() => {
    if (settingsErrors.length > 0) {
      let errors;
      if (typeof settingsErrors === 'object') {
        errors = JSON.stringify(settingsErrors, null, 2);
      } else {
        errors = settingsErrors;
      }
      Alert.alert(
        'Errors Detected',
        `Error(s) while loading the settings: ${errors}. Will load default settings`,
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(clearSettingsErrors());
            },
            style: 'cancel',
          },
        ],
        { cancelable: false },
      );
    } else if (dailyConsumptionErrors.length > 0) {
      let errors;
      if (typeof dailyConsumptionErrors === 'object') {
        errors = JSON.stringify(dailyConsumptionErrors, null, 2);
      } else {
        errors = dailyConsumptionErrors;
      }
      Alert.alert(
        'Errors Detected',
        `Error(s) while updating data: ${errors}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(clearDaylyConsumptionErrors());
            },
            style: 'cancel',
          },
        ],
        { cancelable: false },
      );
    }
  }, [settingsErrors, dailyConsumptionErrors]);

  if (dailyDataIsLoading || settingsDataIsLoading) {
    return (
      <View style={{ flex: 1, marginVertical: 'auto', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackVisible: true,
        header: (props) => <CustomNavigationBar {...props} />,
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="Calculator" component={Caluclator} />
    </Stack.Navigator>
  );
};

export default AppStack;
