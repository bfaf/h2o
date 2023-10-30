import { createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_CURRENT_DATE } from "../../../../constants";
import { getCurrentDate } from "../../../../utils/date";

export const fetchCurrentDate = createAsyncThunk(
    'currentDate/fetchCurrentDateValue',
    async (thunkAPI, { rejectWithValue }) => {
        try {
            const value = await AsyncStorage.getItem(STORE_KEY_CURRENT_DATE);
            if (value != null) {
                return value;
            } else {
                const date = getCurrentDate();
                await AsyncStorage.setItem(STORE_KEY_CURRENT_DATE, date);
                return date;
            }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const setCurrentDate = createAsyncThunk(
    'currentDate/setCurrentDateValue',
    async (thunkAPI, { rejectWithValue }) => {
        try {
            const date = getCurrentDate();
            await AsyncStorage.setItem(STORE_KEY_CURRENT_DATE, date);
            return date;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);