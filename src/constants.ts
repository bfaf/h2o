export const DEFAULT_DAILY_CONSUMPTION = 3500; // this is in milliters
export const DEFAULT_WATER_INCREASE_WHEN_COFFEE_ADDED = 200; // milliters
export const NOTIFICATION_REPEAT_INTERVAL = 60; // minutes

export const STORE_KEY_WATER_CONSUMED_SO_FAR = 'waterConsumedSoFar';
export const STORE_KEY_DAILY_CONSUMPTION = 'desiredDailyConsumption';
export const STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE = 'desiredDailyWithCoffeeConsumption';
export const STORE_KEY_COFFEES_CONSUMPTION = 'coffeesConsumed';
export const STORE_KEY_GLASSES_OF_WATER_CONSUMED = 'glassesOfWaterConsumed';
export const STORE_KEY_WATER_LEVEL_SO_FAR = 'waterLevelSoFar';
export const STORE_KEY_CURRENT_DATE = 'currentDate';

export const STORE_KEY_SETTINGS_WATER_PER_COFFEE_CUP = 'settings.reminder.waterPerCoffeeCup';
export const STORE_KEY_SETTINGS_REPEAT_INTERVAL = 'settings.reminder.repeatInterval';
export const STORE_KEY_SETTINGS_REMINDER_SWITCH = 'settings.reminder.switch';
export const STORE_KEY_SETTINGS_FROM_DATE = 'settings.reminder.fromDate';
export const STORE_KEY_SETTINGS_TO_DATE = 'settings.reminder.toDate';

export const NOTIFICATION_QUICK_ACTIONS = [
    {
        id: '200ml',
        title: '200 ml',
        pressAction: {
            id: '200ml',
        },
    },
    {
        id: '300ml',
        title: '300 ml',
        pressAction: {
            id: '300ml',
        },
    },
    {
        id: '500ml',
        title: '500 ml',
        pressAction: {
            id: '500ml',
        },
    },
    {
        id: 'coffee',
        title: 'Coffee',
        pressAction: {
            id: 'coffee',
        },
    },
];
