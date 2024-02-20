import { createSlice } from '@reduxjs/toolkit';
import { type RootState } from '../store';
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

export const settingsInitialState: SettingsState = {
  remindersToggleEnabled: true,
  waterPerCoffeeCup: 200,
  repeatInterval: 60,
  fromTime: new Date(2024, 1, 1, 9, 0, 0).toISOString(),
  toTime: new Date(2024, 1, 1, 18, 0, 0).toISOString(),
  femaleIcon: true,
  waterAmounts: ['200', '300', '500'],
  settingsErrors: [],
  settingsDataIsLoading: true,
};

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
        return {
          ...state,
          remindersToggleEnabled: action.payload.remindersToggleEnabled,
          fromTime: action.payload.fromTime,
          toTime: action.payload.toTime,
          waterPerCoffeeCup: action.payload.waterPerCoffeeCup,
          repeatInterval: action.payload.repeatInterval,
          femaleIcon: action.payload.femaleIcon,
          waterAmounts: action.payload.waterAmounts,
          settingsDataIsLoading: false,
        };
      })
      .addCase(fetchAllSettings.pending, (state, action) => {
        return {
          ...state,
          settingsDataIsLoading: true,
        };
      })
      .addCase(fetchAllSettings.rejected, (state, action) => {
        return {
          ...state,
          settingsDataIsLoading: false,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(setWaterPerCoffeeCup.fulfilled, (state, action) => {
        return {
          ...state,
          waterPerCoffeeCup: action.payload,
        };
      })
      .addCase(setWaterPerCoffeeCup.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(setRepeatInterval.fulfilled, (state, action) => {
        return {
          ...state,
          repeatInterval: action.payload,
        };
      })
      .addCase(setRepeatInterval.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(setFromDate.fulfilled, (state, action) => {
        return {
          ...state,
          fromTime: action.payload,
        };
      })
      .addCase(setFromDate.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(setToDate.fulfilled, (state, action) => {
        return {
          ...state,
          toTime: action.payload,
        };
      })
      .addCase(setToDate.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(setHumanIcon.fulfilled, (state, action) => {
        return {
          ...state,
          femaleIcon: action.payload,
        };
      })
      .addCase(setHumanIcon.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(addWaterAmount.fulfilled, (state, action) => {
        return {
          ...state,
          waterAmounts: action.payload,
        };
      })
      .addCase(addWaterAmount.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      })
      .addCase(removeWaterAmount.fulfilled, (state, action) => {
        return {
          ...state,
          waterAmounts: action.payload,
        };
      })
      .addCase(removeWaterAmount.rejected, (state, action) => {
        return {
          ...state,
          settingsErrors: [...state.settingsErrors, (action.payload as Error).message],
        };
      });
  },
});

export const { clearSettingsErrors } = settingsSlice.actions;

export const settings = (state: RootState) => state.settings;
export default settingsSlice.reducer;
