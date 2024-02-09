import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { addWaterAmount, fetchAllSettings, removeWaterAmount, setFromDate, setHumanIcon, setReminderSwitch, setRepeatInterval, setToDate, setWaterPerCoffeeCup } from "../thunks/settings";

interface SettingsState {
    remindersToggleEnabled: boolean;
    waterPerCoffeeCup: number;
    fromTime: string;
    toTime: string;
    repeatInterval: number; // minutes
    femaleIcon: boolean;
    waterAmounts: string[]; // '200', '300', '500'
    errors: SerializedError | null;
}

export const settingsInitialState = {
    remindersToggleEnabled: true,
    waterPerCoffeeCup: 200,
    repeatInterval: 60,
    fromTime: new Date(2024, 1, 1, 9, 0, 0).toISOString(),
    toTime: new Date(2024, 1, 1, 18, 0, 0).toISOString(),
    femaleIcon: true,
    waterAmounts: ['200', '300', '500'],
    errors: null,
} as SettingsState

const settingsSlice = createSlice({
    name: "settings",
    initialState: settingsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setReminderSwitch.fulfilled, (state, action) => {
            state.remindersToggleEnabled = action.payload;
        })
            .addCase(fetchAllSettings.fulfilled, (state, action) => {
                state.remindersToggleEnabled = action.payload.remindersToggleEnabled;
                state.fromTime = action.payload.fromTime;
                state.toTime = action.payload.toTime;
                state.waterPerCoffeeCup = action.payload.waterPerCoffeeCup;
                state.repeatInterval = action.payload.repeatInterval;
                state.femaleIcon = action.payload.femaleIcon;
                state.waterAmounts = action.payload.waterAmounts;
            })
            .addCase(fetchAllSettings.rejected, (state, action) => {
                state.errors = action.error;
            })
            .addCase(setWaterPerCoffeeCup.fulfilled, (state, action) => {
                state.waterPerCoffeeCup = action.payload;
            })
            .addCase(setRepeatInterval.fulfilled, (state, action) => {
                state.repeatInterval = action.payload;
            })
            .addCase(setFromDate.fulfilled, (state, action) => {
                state.fromTime = action.payload;
            })
            .addCase(setToDate.fulfilled, (state, action) => {
                state.toTime = action.payload;
            })
            .addCase(setHumanIcon.fulfilled, (state, action) => {
                state.femaleIcon = action.payload;
            })
            .addCase(addWaterAmount.fulfilled, (state, action) => {
                state.waterAmounts = action.payload;
            })
            .addCase(removeWaterAmount.fulfilled, (state, action) => {
                state.waterAmounts = action.payload;
            })
    },
});

export const settings = (state: RootState) => state.settings;
export default settingsSlice.reducer;