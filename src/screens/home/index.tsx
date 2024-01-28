/**
 * @format
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Image,
  Platform,
  AppState,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../stores/redux/store';
import { daylyConsumption } from '../../stores/redux/slices/daylyConsumptionSlice';
import { FAB, Portal, Icon } from 'react-native-paper';
import WaterLevelContainer from './waterLevelContainer';
import notifee, {
  AndroidImportance,
  EventType,
  IntervalTrigger,
  RepeatFrequency,
  TimeUnit,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import {
  fetchSettingDesiredDailyConsumption,
  fetchWaterConsumptionSoFar,
  fetchWaterLevelSoFar,
  fetchCoffeesConsumedSoFar,
  addWaterLevelSoFar,
  addCoffeesConsumed,
  addWaterConsumedSoFar,
  resetDailyData,
} from '../../stores/redux/thunks/dailyConsumption';
import { currentDateSelector } from '../../stores/redux/slices/currentDateSlice';
import { getCurrentDate } from '../../utils/date';
import {
  fetchCurrentDate,
  setCurrentDate,
} from '../../stores/redux/thunks/currentDate';
import { NOTIFICATION_QUICK_ACTIONS, NOTIFICATION_REPEAT_INTERVAL } from '../../constants';

export const Home = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const [openLiquids, setOpenLiquids] = useState<boolean>(false);
  const [errors, setErrors] = useState<unknown>();
  const {
    currentConsumtionMl,
    desiredDailyConsumption,
    waterLevel,
    coffeesConsumed,
  } = useSelector(daylyConsumption);
  const { currentDate } = useSelector(currentDateSelector);

  const scheduleNotification = async (
    interval: number,
    drankSoFarMl: number,
    totalMl: number,
  ) => {
    // Create a time-based trigger
    const trigger: IntervalTrigger = {
      type: TriggerType.INTERVAL,
      interval,
      timeUnit: TimeUnit.MINUTES,
    };

    // Create a trigger notification
    try {
      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'h2o-channel',
        name: 'h2o Channel',
        importance: AndroidImportance.DEFAULT,
      });
      await notifee.createTriggerNotification(
        {
          id: 'reminder',
          title: 'Reminder to drink water',
          body: `Drank ${drankSoFarMl}ml so far out of ${totalMl}ml`,
          android: {
            channelId,
            actions: NOTIFICATION_QUICK_ACTIONS,
          },
          ios: {
            categoryId: 'h2o-actions',
            interruptionLevel: 'timeSensitive',
          },
        },
        trigger,
      );
    } catch (err) {
      console.log('Got an error when creating repeatable trigger', err);
      setErrors(err);
    }
  };

  const scheduleDailyNotification = async (date: Date) => {
    // Create a time-based trigger
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    try {
      const channelId = await notifee.createChannel({
        id: 'h2o-channel',
        name: 'h2o Channel',
        importance: AndroidImportance.DEFAULT,
      });
      // Create a trigger notification
      await notifee.createTriggerNotification(
        {
          title: 'Reminder to drink water',
          body: 'Please drink water',
          android: {
            channelId,
            actions: NOTIFICATION_QUICK_ACTIONS,
          },
          ios: {
            categoryId: 'h2o-actions',
            interruptionLevel: 'timeSensitive',
          },
        },
        trigger,
      );
    } catch (err) {
      console.log('Got an error when creating daily trigger', err);
      setErrors(err);
    }
  };

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
    // intentionally the start number is 5.
    // This should autostart display notifications on next day at 9 or earlier
    if (date.getHours() >= 5 && date.getHours() < 18) {
      const ids = await notifee.getTriggerNotificationIds();
      if (ids.length > 2) {
        await notifee.cancelAllNotifications();
      }

      scheduleNotification(
        NOTIFICATION_REPEAT_INTERVAL,
        currentConsumtionMl,
        desiredDailyConsumption,
      ); // Repeatable the whole day
    } else {
      await notifee.cancelAllNotifications();
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

  useEffect(() => {
    const reqPerm = async () => {
      await notifee.requestPermission();

      await notifee.setNotificationCategories([
        {
          id: 'h2o-actions',
          actions: NOTIFICATION_QUICK_ACTIONS,
        },
      ]);
    };
    reqPerm();
  }, []);

  useEffect(() => {
    const initValues = async () => {
      try {
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', _nextAppState => {
      resetAndSchedule();
    });
    resetAndSchedule(); // When app is launched if OS closed it

    return () => {
      subscription.remove();
    };
  }, [resetAndSchedule]);

  const calculateIncrease = useCallback(
    (value: number) => {
      const totalHeight = 200;
      const calculated = totalHeight * (value / desiredDailyConsumption);
      if (waterLevel - calculated < 0) {
        dispatch(addWaterLevelSoFar(0));
        return;
      }

      dispatch(addWaterLevelSoFar(waterLevel - calculated));
    },
    [dispatch, desiredDailyConsumption, waterLevel],
  );

  const handleNotificationAction = useCallback(
    (notifId: string | undefined) => {
      switch (notifId) {
        case '200ml':
          dispatch(addWaterConsumedSoFar(200));
          calculateIncrease(200);
          break;
        case '300ml':
          dispatch(addWaterConsumedSoFar(300));
          calculateIncrease(300);
          break;
        case '500ml':
          dispatch(addWaterConsumedSoFar(500));
          calculateIncrease(500);
          break;
        case 'coffee':
          dispatch(addCoffeesConsumed());
          calculateIncrease(-200);
          break;
      }
    },
    [dispatch, calculateIncrease],
  );

  useEffect(() => {
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail?.pressAction?.id);
      }
    });
  }, [handleNotificationAction, resetAndSchedule]);

  useEffect(() => {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      await resetAndSchedule();
      if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail?.pressAction?.id);
      }
    });
  }, [handleNotificationAction, resetAndSchedule]);

  const renderMaskedView = (waterLevel: number) => {
    const isIOS = Platform.OS === 'ios';
    if (isIOS) {
      return (
        <MaskedView
          key="maskedView"
          style={styles.maskedView}
          maskElement={<WaterLevelContainer increse={waterLevel} />}>
          <Image
            key="watered"
            source={require('../../images/human-watered-200.png')}
            style={styles.mask}
          />
        </MaskedView>
      );
    } else {
      return (
        <MaskedView
          key="maskedView"
          style={styles.maskedView}
          maskElement={<WaterLevelContainer increse={waterLevel} />}>
          <Image
            key="watered"
            source={require('../../images/human-watered-200.png')}
            style={styles.mask}
          />
        </MaskedView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dailyLimit}>
        <Text style={styles.dailyLimitText}>Daily limit</Text>
        <Text style={styles.dailyLimitText}>{desiredDailyConsumption} ml</Text>
        <Text style={styles.dailyLimitTextSmall}>
          {coffeesConsumed} <Icon source="coffee" size={14} color="#000" />{' '}
          included
        </Text>
      </View>
      <View style={styles.maskView}>
        <Image
          key="top"
          source={require('../../images/human-200.png')}
          style={styles.image}
        />
        {renderMaskedView(waterLevel)}
      </View>
      <View style={styles.consumedSoFarView}>
        <Text style={styles.dailyLimitText}>{currentConsumtionMl} ml</Text>
        <Text style={styles.dailyLimitTextSmall}>so far</Text>
      </View>
      {errors != null && (<View>
        <Text>{`Error: ${errors}`}</Text>
      </View>)
      }
      <Portal>
        <FAB.Group
          open={openLiquids}
          visible
          icon="plus"
          onStateChange={({ open }) => setOpenLiquids(open)}
          actions={[
            {
              icon: 'coffee',
              label: '+ Coffee',
              onPress: () => {
                dispatch(addCoffeesConsumed());
                calculateIncrease(-200);
              },
            },
            {
              icon: 'cup',
              label: '+ 500ml',
              onPress: () => {
                dispatch(addWaterConsumedSoFar(500));
                calculateIncrease(500);
              },
            },
            {
              icon: 'cup',
              label: '+ 300ml',
              onPress: () => {
                dispatch(addWaterConsumedSoFar(300));
                calculateIncrease(300);
              },
            },
            {
              icon: 'cup',
              label: '+ 200ml',
              onPress: () => {
                dispatch(addWaterConsumedSoFar(200));
                calculateIncrease(200);
              },
            },
          ]}
        />
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
  dailyLimit: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignContent: 'center',
    marginBottom: 20,
  },
  dailyLimitText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  dailyLimitTextSmall: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  consumedSoFarView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    marginTop: 20,
  },
  maskView: {
    flex: 0,
    justifyContent: 'center',
    alignContent: 'center',
    height: 200,
    flexDirection: 'row',
    position: 'relative',
  },
  maskedView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    height: 200,
  },
  maskWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    flex: 1,
    height: 200,
    zIndex: 10,
    position: 'absolute',
  },
  image: {
    flex: 1,
    height: 200,
    position: 'absolute',
  },
});
