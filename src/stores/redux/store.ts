import {
  combineReducers,
  configureStore,
  PreloadedState
} from '@reduxjs/toolkit';

import daylyConsumptionReducer from './slices/daylyConsumptionSlice';

const rootReducer = combineReducers({
  daylyConsumption: daylyConsumptionReducer
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
