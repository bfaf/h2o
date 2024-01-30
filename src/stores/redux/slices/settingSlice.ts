import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchAllSettings, setFromDate, setHumanIcon, setReminderSwitch, setRepeatInterval, setToDate, setWaterPerCoffeeCup } from "../thunks/settings";

interface SettingsState {
    remindersToggleEnabled: boolean;
    waterPerCoffeeCup: number,
    fromTime: string,
    toTime: string,
    repeatInterval: number, // minutes
    femaleIcon: boolean,
    errors: SerializedError | null;
  }

  const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        remindersToggleEnabled: true,
        waterPerCoffeeCup: 200,
        repeatInterval: 60,
        fromTime: new Date(2024, 1, 1, 9, 0, 0).toISOString(),
        toTime: new Date(2024, 1, 1, 18, 0, 0).toISOString(),
        femaleIcon: true,
        errors: null,
    } as SettingsState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setReminderSwitch.fulfilled, (state, action) => {
            state.remindersToggleEnabled = action.payload;
        })
        .addCase(fetchAllSettings.fulfilled, (state, action) => {
            state = {
                ...action.payload,
                errors: null
            };
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
    },
  });

export const settings = (state: RootState) => state.settings;
export default settingsSlice.reducer;