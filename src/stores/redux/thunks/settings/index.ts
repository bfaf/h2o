import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_SETTINGS_FROM_DATE, STORE_KEY_SETTINGS_HUMAN_ICON, STORE_KEY_SETTINGS_REMINDER_SWITCH, STORE_KEY_SETTINGS_REPEAT_INTERVAL, STORE_KEY_SETTINGS_TO_DATE, STORE_KEY_SETTINGS_WATER_PER_COFFEE_CUP } from "../../../../constants";

export const setReminderSwitch = createAsyncThunk(
    'settings/setReminderSwitch',
    async (value: boolean, { rejectWithValue }) => {
        try {
            await AsyncStorage.setItem(STORE_KEY_SETTINGS_REMINDER_SWITCH, value.toString());
            return value;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const setWaterPerCoffeeCup = createAsyncThunk(
    'settings/setWaterPerCoffeeCup',
    async (value: number, { rejectWithValue }) => {
        try {
            await AsyncStorage.setItem(STORE_KEY_SETTINGS_WATER_PER_COFFEE_CUP, value.toString());
            return value;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const setRepeatInterval = createAsyncThunk(
    'settings/setRepeatInterval',
    async (value: number, { rejectWithValue }) => {
        try {
            await AsyncStorage.setItem(STORE_KEY_SETTINGS_REPEAT_INTERVAL, value.toString());
            return value;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const setFromDate = createAsyncThunk(
    'settings/setFromDate',
    async (value: string, { rejectWithValue }) => {
        try {
            await AsyncStorage.setItem(STORE_KEY_SETTINGS_FROM_DATE, value);
            return value;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const setToDate = createAsyncThunk(
    'settings/setToDate',
    async (value: string, { rejectWithValue }) => {
        try {
            await AsyncStorage.setItem(STORE_KEY_SETTINGS_TO_DATE, value);
            return value;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const setHumanIcon = createAsyncThunk(
    'settings/setHumanIcon',
    async (isFemaleIcon: boolean, { rejectWithValue }) => {
        try {
            await AsyncStorage.setItem(STORE_KEY_SETTINGS_HUMAN_ICON, isFemaleIcon.toString());
            return isFemaleIcon;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const fetchAllSettings = createAsyncThunk(
    'settings/fetchAllSettings',
    async (_, { rejectWithValue }) => {
        try {
            const values = await Promise.all([
                AsyncStorage.getItem(STORE_KEY_SETTINGS_REMINDER_SWITCH),
                AsyncStorage.getItem(STORE_KEY_SETTINGS_WATER_PER_COFFEE_CUP),
                AsyncStorage.getItem(STORE_KEY_SETTINGS_REPEAT_INTERVAL),
                AsyncStorage.getItem(STORE_KEY_SETTINGS_FROM_DATE),
                AsyncStorage.getItem(STORE_KEY_SETTINGS_TO_DATE),
                AsyncStorage.getItem(STORE_KEY_SETTINGS_HUMAN_ICON),
            ]);
            if (values.every(val => val != null)) {
                // console.log('All values found');
                // values.forEach((v, i) => console.log(i, v));
                return {
                    remindersToggleEnabled: values[0] === 'true',
                    waterPerCoffeeCup: Number(values[1]),
                    repeatInterval: Number(values[2]),
                    fromTime: values[3] != null ? values[3] : new Date(2024, 1, 1, 9, 0, 0).toISOString(),
                    toTime: values[4] != null ? values[4] : new Date(2024, 1, 1, 18, 0, 0).toISOString(),
                    femaleIcon: values[5] === 'true'
                };
            } else {
                // console.log('At least one value not found');
                // values.forEach((v, i) => console.log(i, v));
                const fromTime = new Date(2024, 1, 1, 9, 0, 0).toISOString();
                const toTime = new Date(2024, 1, 1, 18, 0, 0).toISOString();
                await AsyncStorage.setItem(STORE_KEY_SETTINGS_REMINDER_SWITCH, 'true');
                await AsyncStorage.setItem(STORE_KEY_SETTINGS_WATER_PER_COFFEE_CUP, '200');
                await AsyncStorage.setItem(STORE_KEY_SETTINGS_REPEAT_INTERVAL, '60');
                await AsyncStorage.setItem(STORE_KEY_SETTINGS_FROM_DATE, fromTime);
                await AsyncStorage.setItem(STORE_KEY_SETTINGS_TO_DATE, toTime); 
                await AsyncStorage.setItem(STORE_KEY_SETTINGS_HUMAN_ICON, 'true'); 
                return {
                    remindersToggleEnabled: true,
                    waterPerCoffeeCup: 200,
                    repeatInterval: 60,
                    fromTime,
                    toTime,
                    femaleIcon: true
                };
            }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);
