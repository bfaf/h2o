import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { Alert } from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import { SettingsState } from "../stores/redux/slices/settingSlice";
import { updateValue } from "./db-service";
import { DailyConsumptionState } from "../stores/redux/slices/daylyConsumptionSlice";
import { CurrentDateState } from "../stores/redux/slices/currentDateSlice";

export const getCurrentDate = (): string => {
    const today = new Date();
    const month = today.getMonth() < 10 ? `0${today.getMonth()}` : today.getMonth();
    return `${today.getFullYear()}${month}${today.getDate()}`;
};

export const calculateIncrease = (value: number, desiredDailyConsumption: number, currentlyConsumedWater: number): number => {
    const totalHeight = 200;
    let calculated = ((value / desiredDailyConsumption) * totalHeight);
    if (value < 0) {
        calculated = ((value + currentlyConsumedWater) / (desiredDailyConsumption + (value * -1))) * totalHeight;
    } else {
        calculated = ((value + currentlyConsumedWater) / desiredDailyConsumption) * totalHeight;
    }

    if (calculated < 0) {
        return 0;
    }
    const waterLevel = totalHeight - calculated;
    if (waterLevel < 0) {
        return 0;
    } else {
        return waterLevel;
    }
}

export const shouldReset = (currentDate: string, today: string): boolean => {
    if (today.length > 0 && currentDate.length > 0 && today !== currentDate) {
        return true;
    }

    return false;
};

export const shouldAddCoffee = (notifId: string | undefined): boolean => {
    const num = parseInt(notifId || '0');
    return isNaN(num);
};

export const biometricsLogin = async () => {
    const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true })
    const { available, biometryType } = await rnBiometrics.isSensorAvailable()
    if (available) {
        let { success, error } = await rnBiometrics.simplePrompt({ promptMessage: 'Login securely' });
        return { success, error };
    }
}

export const updateSettings = async (value: any, prop: any, params: GetThunkAPI<any>) => {
    return await updateValue<SettingsState>(value, prop, 'settings', 'settings', params);
};

export const updateDailyConsumption = async (value: any, prop: any, params: GetThunkAPI<any>) => {
    return await updateValue<DailyConsumptionState>(value, prop, 'daylyConsumption', 'daylyConsumption', params);
};

export const updateCurrentDate = async (value: any, prop: any, params: GetThunkAPI<any>) => {
    return await updateValue<CurrentDateState>(value, prop, 'currentDate', 'currentDate', params);
};
