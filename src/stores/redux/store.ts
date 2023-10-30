import {
  combineReducers,
  configureStore,
  PreloadedState,
} from '@reduxjs/toolkit';

import daylyConsumptionReducer from './slices/daylyConsumptionSlice';
import currentDateReducer from './slices/currentDateSlice';
import { AppState } from 'react-native';

const rootReducer = combineReducers({
  daylyConsumption: daylyConsumptionReducer,
  currentDate: currentDateReducer,
})

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
