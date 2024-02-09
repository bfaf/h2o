import notifee, {
  AndroidAction,
    AndroidImportance,
    IntervalTrigger,
    RepeatFrequency,
    TimeUnit,
    TimestampTrigger,
    TriggerType,
  } from '@notifee/react-native';
  
export const scheduleNotification = async (
    interval: number,
    drankSoFarMl: number,
    totalMl: number,
    notificationActions: AndroidAction[]
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
          id: 'interval',
          title: 'Reminder to drink water',
          body: `Drank ${drankSoFarMl}ml so far out of ${totalMl}ml`,
          android: {
            channelId,
            actions: notificationActions,
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
    }
  };

  export const scheduleDailyNotification = async (date: Date, notificationActions: AndroidAction[]) => {
    // Create a time-based trigger
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: {
       allowWhileIdle: true         
      }
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
          id: 'daily',
          title: 'Reminder to drink water',
          body: 'Please drink water',
          android: {
            channelId,
            actions: notificationActions,
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
    }
  };