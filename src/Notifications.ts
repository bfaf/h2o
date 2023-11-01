import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform } from "react-native";
import  PushNotification from "react-native-push-notification";

class Notifications {
    constructor() {
        PushNotification.configure({
            onRegister: (token: any) => {
                console.log(token);
            },
            onNotification: (notification: any) => {
                console.log(notification);

                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            popInitialNotification: false,
            requestPermissions: Platform.OS === 'ios',
        });

        PushNotification.createChannel(
            {
                channelId: 'reminders',
                channelName: 'Krasi reminder',
                channelDescription: 'Reminder for water'
            },
            () => {},
        );

        PushNotification.getScheduledLocalNotifications((rn: any) => {
            console.log('SN --- ', rn);
        });
    }

    scheduleNotification(date: Date) {
        console.log('schedule notification');
        PushNotification.localNotificationSchedule({
            channelId: 'reminders',
            title: 'Reminder',
            message: 'Drink water',
            date
        });
    }
}

export default new Notifications();