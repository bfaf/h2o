import { configureStore } from '@reduxjs/toolkit';
import daylyConsumptionReducer from './slices/daylyConsumptionSlice';

export const store = configureStore({
  reducer: {
    daylyConsumption: daylyConsumptionReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
