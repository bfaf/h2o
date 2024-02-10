import { useCallback, useEffect, useMemo } from "react";
import { scheduleNotification, scheduleDailyNotification } from "./notifications";
import { useDispatch, useSelector } from "react-redux";
import { daylyConsumption } from "../stores/redux/slices/daylyConsumptionSlice";
import { settings } from "../stores/redux/slices/settingSlice";
import notifee, { AndroidAction, AndroidNotificationSetting, EventType, IOSNotificationCategoryAction } from '@notifee/react-native';
import { fetchCurrentDate, setCurrentDate } from "../stores/redux/thunks/currentDate";
import { addCoffeesConsumed, addWaterConsumedSoFar, addWaterLevelSoFar, fetchAllDailyConsumptionData, resetDailyData } from "../stores/redux/thunks/dailyConsumption";
import { biometricsLogin, calculateIncrease, getCurrentDate, shouldAddCoffee, shouldReset } from "./utils";
import { currentDateSelector } from "../stores/redux/slices/currentDateSlice";
import { AppDispatch } from "../stores/redux/store";
import { Alert, AppState } from "react-native";
import { fetchAllSettings } from "../stores/redux/thunks/settings";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";

export const useSchedule = () => {
    const {
        currentConsumtionMl,
        desiredDailyConsumption,
    } = useSelector(daylyConsumption);
    const {
        remindersToggleEnabled,
        repeatInterval,
        fromTime,
        toTime,
    } = useSelector(settings);
    const notificationActions = useNotificationActions();

    return useCallback(async () => {
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
                notificationActions,
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
            scheduleDailyNotification(nextDayNotif, notificationActions);
        }
    }, [currentConsumtionMl, desiredDailyConsumption, remindersToggleEnabled, fromTime, toTime, repeatInterval]);
};

export const useResetAndSchedule = () => {
    const dispatch: AppDispatch = useDispatch();
    const schedule = useSchedule();
    const { currentDate } = useSelector(currentDateSelector);

    return useCallback(async () => {
        const today = getCurrentDate();
        if (shouldReset(currentDate, today)) {
            await dispatch(setCurrentDate());
            await dispatch(resetDailyData());
        }
        await schedule();
    }, [shouldReset, schedule, dispatch, getCurrentDate, setCurrentDate, resetDailyData, currentDate]);
};

export const useHandleNotificationAction = () => {
    const dispatch: AppDispatch = useDispatch();
    const {
        currentConsumtionMl,
        desiredDailyConsumption,
    } = useSelector(daylyConsumption);
    const {
        waterPerCoffeeCup,
    } = useSelector(settings);

    return useCallback(
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
};

export const useCreateAction = () => {
    const createAction = useHandleNotificationAction();
    return useCallback((amount: string) => {
        const num = parseInt(amount);
        const isCoffee = isNaN(num);
        return {
            icon: isCoffee ? 'coffee' : 'cup',
            label: isCoffee ? '+ Coffee' : `+ ${amount}ml`,
            onPress: () => createAction(amount),
        };
    }, [createAction]);
};

export const useAppState = () => {
    const resetAndSchedule = useResetAndSchedule();

    return useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                biometricsLogin();
            }
            resetAndSchedule();
            
        });
        biometricsLogin();
        resetAndSchedule(); // When app is launched if OS closed it

        return () => {
            subscription.remove();
        };
    }, [resetAndSchedule]);
};

export const useInitValues = () => {
    const dispatch: AppDispatch = useDispatch();
    const notificationActions = useNotificationActions() as IOSNotificationCategoryAction[];

    return useEffect(() => {
        const initValues = async () => {
            try {
                await notifee.requestPermission(); // required for iOS
                await notifee.setNotificationCategories([
                    {
                        id: 'h2o-actions',
                        actions: notificationActions,
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
                await dispatch(fetchAllDailyConsumptionData());
                await dispatch(fetchAllSettings());
            } catch (err) {
                // need to use common way to display errors
                console.log(err);
            }
        };
        initValues();
    }, [dispatch]);
};

export const useNotificationFrontendService = () => {
    const handleNotificationAction = useHandleNotificationAction();

    return useEffect(() => {
        return notifee.onForegroundEvent(async ({ type, detail }) => {
            if (type === EventType.ACTION_PRESS) {
                await handleNotificationAction(detail?.pressAction?.id);
            }
        });
    }, [handleNotificationAction]);
};

export const useNotificationBackgroundService = () => {
    const handleNotificationAction = useHandleNotificationAction();
    const resetAndSchedule = useResetAndSchedule();

    return useEffect(() => {
        notifee.onBackgroundEvent(async ({ type, detail }) => {
            await resetAndSchedule();
            if (type === EventType.ACTION_PRESS) {
                await handleNotificationAction(detail?.pressAction?.id);
            }
        });
    }, [handleNotificationAction, resetAndSchedule]);
};

export const useSortedWaterAmounts = () => {
    const {
        waterAmounts
    } = useSelector(settings);

    return useMemo(() => {
        return [...waterAmounts].sort((a, b) => {
            if (parseInt(a) > parseInt(b)) return -1;
            if (parseInt(a) < parseInt(b)) return 1;
            return 0;
        });
    }, [waterAmounts]);
};

export const useNotificationActions = () => {
    const {
        waterAmounts
    } = useSelector(settings);
    const sortedWaterAmounts = [...waterAmounts].sort((a, b) => {
        if (parseInt(a) > parseInt(b)) return 1;
        if (parseInt(a) < parseInt(b)) return -1;
        return 0;
    });

    return useMemo(() => {
        const actions: AndroidAction[] | IOSNotificationCategoryAction[] = [];

        sortedWaterAmounts.forEach((amount) => {
            actions.push(
                {
                    id: amount,
                    title: `${amount} ml`,
                    pressAction: {
                        id: amount,
                    },
                }
            );
        });

        actions.push({
            id: 'coffee',
            title: 'Coffee',
            pressAction: {
                id: 'coffee',
            },
        })

        return actions;
    }, [sortedWaterAmounts]);
};
