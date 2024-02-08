import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings, History, Caluclator } from './screens';
import CustomNavigationBar from './components/custom-nav-bar';
import { AppDispatch } from './stores/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { NOTIFICATION_QUICK_ACTIONS } from './constants';
import notifee, {
    AndroidNotificationSetting,
    EventType
} from '@notifee/react-native';
import { fetchCurrentDate, setCurrentDate } from './stores/redux/thunks/currentDate';
import { fetchSettingDesiredDailyConsumption, fetchWaterConsumptionSoFar, fetchWaterLevelSoFar, fetchCoffeesConsumedSoFar, resetDailyData, addWaterLevelSoFar, addCoffeesConsumed, addWaterConsumedSoFar } from './stores/redux/thunks/dailyConsumption';
import { Alert, AppState } from 'react-native';
import { currentDateSelector } from './stores/redux/slices/currentDateSlice';
import { daylyConsumption } from './stores/redux/slices/daylyConsumptionSlice';
import { calculateIncrease, getCurrentDate, shouldAddCoffee, shouldReset } from './utils/utils';
import { fetchAllSettings } from './stores/redux/thunks/settings';
import { settings } from './stores/redux/slices/settingSlice';
import { scheduleDailyNotification, scheduleNotification } from './utils/notifications';

const Stack = createNativeStackNavigator();

const AppStack = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const { currentDate } = useSelector(currentDateSelector);
    const {
        currentConsumtionMl,
        desiredDailyConsumption,
    } = useSelector(daylyConsumption);
    const {
        remindersToggleEnabled,
        waterPerCoffeeCup,
        repeatInterval,
        fromTime,
        toTime,
    } = useSelector(settings);

    const schedule = useCallback(async () => {
        if (!remindersToggleEnabled) {
            await notifee.cancelAllNotifications();
            return;
        }
        const fromTimeConverted = new Date(Date.parse(fromTime));
        const toTimeConverted = new Date(Date.parse(toTime));
        const date = new Date();
        const ids = await notifee.getTriggerNotificationIds();
        if (date.getHours() >= fromTimeConverted.getHours() && date.getHours() < toTimeConverted.getHours()) {
            if (ids.includes('daily')) {
                await notifee.cancelAllNotifications();
            }
            scheduleNotification(
                repeatInterval,
                currentConsumtionMl,
                desiredDailyConsumption,
            ); // Repeatable the whole day
        } else {
            if (ids.includes('interval')) {
                await notifee.cancelAllNotifications();
            }
            if (ids.includes('daily')) {
                return;
            }
            const now = new Date();
            const nextDayNotif = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
                fromTimeConverted.getHours(),
                0,
                0,
            );
            scheduleDailyNotification(nextDayNotif);
        }
    }, [currentConsumtionMl, desiredDailyConsumption, remindersToggleEnabled, fromTime, toTime, repeatInterval]);

    const resetAndSchedule = useCallback(async () => {
        const today = getCurrentDate();
        if (shouldReset(currentDate, today)) {
            await dispatch(setCurrentDate());
            await dispatch(resetDailyData());
        }
        await schedule();
    }, [shouldReset, schedule, dispatch, getCurrentDate, setCurrentDate, resetDailyData, currentDate]);

    const handleNotificationAction = useCallback(
        async (notifId: string | undefined) => {
            const num = parseInt(notifId || '0');
            let calculated = 0;
            if (shouldAddCoffee(notifId)) {
                // coffee
                await dispatch(addCoffeesConsumed(waterPerCoffeeCup));
                calculated = calculateIncrease(-waterPerCoffeeCup, desiredDailyConsumption, currentConsumtionMl);
            } else {
                await dispatch(addWaterConsumedSoFar(num));
                calculated = calculateIncrease(num, desiredDailyConsumption, currentConsumtionMl);
            }
            await dispatch(addWaterLevelSoFar(calculated));
        },
        [dispatch, calculateIncrease, desiredDailyConsumption, currentConsumtionMl, waterPerCoffeeCup],
    );

    useEffect(() => {
        const initValues = async () => {
            try {
                await notifee.requestPermission(); // required for iOS
                await notifee.setNotificationCategories([
                    {
                        id: 'h2o-actions',
                        actions: NOTIFICATION_QUICK_ACTIONS,
                    },
                ]);

                const settings = await notifee.getNotificationSettings();
                if (settings.android.alarm == AndroidNotificationSetting.DISABLED) {
                    Alert.alert(
                        'Restrictions Detected',
                        'To ensure notifications are delivered, please adjust your settings to allow permissions for Alarms',
                        [
                            // 3. launch intent to navigate the user to the appropriate screen
                            {
                                text: 'OK, open settings',
                                onPress: async () => await notifee.openAlarmPermissionSettings(),
                            },
                            {
                                text: "Cancel",
                                onPress: () => { },
                                style: "cancel"
                            },
                        ],
                        { cancelable: false }
                    );
                }
                const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
                if (batteryOptimizationEnabled) {
                    Alert.alert(
                        'Restrictions Detected',
                        'To ensure notifications are delivered, please disable battery optimization for the app.',
                        [
                            // 3. launch intent to navigate the user to the appropriate screen
                            {
                                text: 'OK, open settings',
                                onPress: async () => await notifee.openBatteryOptimizationSettings(),
                            },
                            {
                                text: "Cancel",
                                onPress: () => { },
                                style: "cancel"
                            },
                        ],
                        { cancelable: false }
                    );
                }

                await dispatch(fetchCurrentDate());
                await dispatch(fetchSettingDesiredDailyConsumption());
                await dispatch(fetchAllSettings());
                await dispatch(fetchWaterConsumptionSoFar());
                await dispatch(fetchWaterLevelSoFar());
                await dispatch(fetchCoffeesConsumedSoFar());
            } catch (err) {
                // need to use common way to display errors
                console.log(err);
            }
        };
        initValues();
    }, [dispatch]);

    // handle app state
    useEffect(() => {
        const subscription = AppState.addEventListener('change', _nextAppState => {
            resetAndSchedule();
        });
        resetAndSchedule(); // When app is launched if OS closed it

        return () => {
            subscription.remove();
        };
    }, [resetAndSchedule]);

    // handle Foreground Events
    useEffect(() => {
        return notifee.onForegroundEvent(async ({ type, detail }) => {
            if (type === EventType.ACTION_PRESS) {
                await handleNotificationAction(detail?.pressAction?.id);
            }
        });
    }, [handleNotificationAction]);

    // handle Background Events
    useEffect(() => {
        notifee.onBackgroundEvent(async ({ type, detail }) => {
            await resetAndSchedule();
            if (type === EventType.ACTION_PRESS) {
                await handleNotificationAction(detail?.pressAction?.id);
            }
        });
    }, [handleNotificationAction, resetAndSchedule]);

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
