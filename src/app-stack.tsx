import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings, History, Caluclator } from './screens';
import CustomNavigationBar from './components/custom-nav-bar';
import { AppDispatch } from './stores/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { NOTIFICATION_QUICK_ACTIONS, NOTIFICATION_REPEAT_INTERVAL } from './constants';
import notifee, {
    AndroidNotificationSetting,
    EventType
} from '@notifee/react-native';
import { fetchCurrentDate, setCurrentDate } from './stores/redux/thunks/currentDate';
import { fetchSettingDesiredDailyConsumption, fetchWaterConsumptionSoFar, fetchWaterLevelSoFar, fetchCoffeesConsumedSoFar, resetDailyData, addWaterLevelSoFar, addCoffeesConsumed, addWaterConsumedSoFar } from './stores/redux/thunks/dailyConsumption';
import { AppState } from 'react-native';
import { currentDateSelector } from './stores/redux/slices/currentDateSlice';
import { daylyConsumption } from './stores/redux/slices/daylyConsumptionSlice';
import { getCurrentDate } from './utils/date';
import { scheduleNotification, scheduleDailyNotification } from './utils/notifications';
import { calculateIncrease } from './utils/hooks';

const Stack = createNativeStackNavigator();

const AppStack = (): JSX.Element => {
    const dispatch: AppDispatch = useDispatch();
    const { currentDate } = useSelector(currentDateSelector);
    const {
        currentConsumtionMl,
        desiredDailyConsumption,
        waterLevel,
    } = useSelector(daylyConsumption);

    const reset = useCallback(() => {
        const today = getCurrentDate();
        if (today.length > 0 && currentDate.length > 0 && today !== currentDate) {
            dispatch(setCurrentDate());
            dispatch(resetDailyData());
        }
    }, [currentDate, dispatch]);

    const resetAndSchedule = useCallback(async () => {
        reset();
        const date = new Date();
        const ids = await notifee.getTriggerNotificationIds();
        if (date.getHours() >= 9 && date.getHours() < 18) {
            if (ids.includes('daily')) {
                await notifee.cancelAllNotifications();
            }

            scheduleNotification(
                NOTIFICATION_REPEAT_INTERVAL,
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
                9,
                0,
                0,
            );
            scheduleDailyNotification(nextDayNotif);
        }
    }, [reset, currentConsumtionMl, desiredDailyConsumption]);

    const handleNotificationAction = useCallback(
        (notifId: string | undefined) => {
            switch (notifId) {
                case '200ml':
                    dispatch(addWaterConsumedSoFar(200));
                    calculateIncrease(200, desiredDailyConsumption, waterLevel, dispatch);
                    break;
                case '300ml':
                    dispatch(addWaterConsumedSoFar(300));
                    calculateIncrease(300, desiredDailyConsumption, waterLevel, dispatch);
                    break;
                case '500ml':
                    dispatch(addWaterConsumedSoFar(500));
                    calculateIncrease(500, desiredDailyConsumption, waterLevel, dispatch);
                    break;
                case 'coffee':
                    dispatch(addCoffeesConsumed());
                    calculateIncrease(-200, desiredDailyConsumption, waterLevel, dispatch);
                    break;
            }
        },
        [dispatch, calculateIncrease, desiredDailyConsumption, waterLevel],
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
                    // Show some user information to educate them on what exact alarm permission is,
                    // and why it is necessary for your app functionality, then send them to system preferences:
                    await notifee.openAlarmPermissionSettings();
                }

                await dispatch(fetchCurrentDate());
                await dispatch(fetchSettingDesiredDailyConsumption());
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
                handleNotificationAction(detail?.pressAction?.id);
            }
        });
    }, [handleNotificationAction]);

    // handle Background Events
    useEffect(() => {
        notifee.onBackgroundEvent(async ({ type, detail }) => {
            await resetAndSchedule();
            if (type === EventType.ACTION_PRESS) {
                handleNotificationAction(detail?.pressAction?.id);
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
