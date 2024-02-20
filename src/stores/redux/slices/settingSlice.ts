import { createSlice, SerializedError } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
  addWaterAmount,
  fetchAllSettings,
  removeWaterAmount,
  setFromDate,
  setHumanIcon,
  setReminderSwitch,
  setRepeatInterval,
  setToDate,
  setWaterPerCoffeeCup,
} from '../thunks/settings';

export interface SettingsState {
  remindersToggleEnabled: boolean;
  waterPerCoffeeCup: number;
  fromTime: string;
  toTime: string;
  repeatInterval: number; // minutes
  femaleIcon: boolean;
  waterAmounts: string[]; // '200', '300', '500'
  settingsErrors: string[];
  settingsDataIsLoading: boolean;
}

export const settingsInitialState = {
  remindersToggleEnabled: true,
  waterPerCoffeeCup: 200,
  repeatInterval: 60,
  fromTime: new Date(2024, 1, 1, 9, 0, 0).toISOString(),
  toTime: new Date(2024, 1, 1, 18, 0, 0).toISOString(),
  femaleIcon: true,
  waterAmounts: ['200', '300', '500'],
  settingsErrors: [],
  settingsDataIsLoading: true,
} as SettingsState;

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState,
  reducers: {
    clearSettingsErrors: (state) => {
      state.settingsErrors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setReminderSwitch.fulfilled, (state, action) => {
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
        state.settingsDataIsLoading = false;
      })
      .addCase(fetchAllSettings.pending, (state, action) => {
        state.settingsDataIsLoading = true;
      })
      .addCase(fetchAllSettings.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
        state.settingsDataIsLoading = false;
      })
      .addCase(setWaterPerCoffeeCup.fulfilled, (state, action) => {
        state.waterPerCoffeeCup = action.payload;
      })
      .addCase(setWaterPerCoffeeCup.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      })
      .addCase(setRepeatInterval.fulfilled, (state, action) => {
        state.repeatInterval = action.payload;
      })
      .addCase(setRepeatInterval.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      })
      .addCase(setFromDate.fulfilled, (state, action) => {
        state.fromTime = action.payload;
      })
      .addCase(setFromDate.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      })
      .addCase(setToDate.fulfilled, (state, action) => {
        state.toTime = action.payload;
      })
      .addCase(setToDate.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      })
      .addCase(setHumanIcon.fulfilled, (state, action) => {
        state.femaleIcon = action.payload;
      })
      .addCase(setHumanIcon.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      })
      .addCase(addWaterAmount.fulfilled, (state, action) => {
        state.waterAmounts = action.payload;
      })
      .addCase(addWaterAmount.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      })
      .addCase(removeWaterAmount.fulfilled, (state, action) => {
        state.waterAmounts = action.payload;
      })
      .addCase(removeWaterAmount.rejected, (state, action) => {
        state.settingsErrors = [...state.settingsErrors, (action.payload as Error).message];
      });
  },
});

export const { clearSettingsErrors } = settingsSlice.actions;

export const settings = (state: RootState) => state.settings;
export default settingsSlice.reducer;
