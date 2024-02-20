import { createSelector, createSlice } from '@reduxjs/toolkit';
import { type RootState } from '../store';
import {
  setSettingDesiredDailyConsumption,
  addCoffeesConsumed,
  addWaterConsumedSoFar,
  addWaterLevelSoFar,
  resetDailyData,
  fetchAllDailyConsumptionData,
  getHistoryData,
  get6MonthsHistoryData,
  getWeekHistoryData,
  getMonthHistoryData,
  get3MonthsHistoryData,
  getWeekAverageHistoryData,
  deleteOldHistoryRecords,
  deleteAllHistoryData,
} from '../thunks/dailyConsumption';
import {
  type BarData,
  type HistoryDataConfig,
  type HistoryDataTimeFilter,
} from '../../../utils/hooks';

export interface HistoryData {
  createdAt: number; // unix timestamp
  currentConsumtionMl: number;
}

export interface DailyConsumptionState {
  currentConsumtionMl: number;
  desiredDailyConsumption: number;
  coffeesConsumed: number;
  glassesOfWaterConsumed: number;
  waterLevel: number;
  dailyConsumptionErrors: string[];
  dailyDataIsLoading: boolean;
  historyDataisLoading: boolean;
  historyData: HistoryData[];
  weekHistoryData: HistoryDataConfig;
  monthHistoryData: HistoryDataConfig;
  months3HistoryData: HistoryDataConfig;
  months6HistoryData: HistoryDataConfig;
  weeklyAverageData: Record<string, BarData>;
}

export const daylyConsumptionInitialState: DailyConsumptionState = {
  currentConsumtionMl: 0,
  desiredDailyConsumption: 3500,
  coffeesConsumed: 0,
  glassesOfWaterConsumed: 0,
  waterLevel: 200,
  dailyConsumptionErrors: [],
  dailyDataIsLoading: true,
  historyDataisLoading: false,
  historyData: [],
  weekHistoryData: { data: [], spacing: 5 },
  monthHistoryData: { data: [], spacing: 5 },
  months3HistoryData: { data: [], spacing: 5 },
  months6HistoryData: { data: [], spacing: 5 },
  weeklyAverageData: {},
};

const daylyConsumptionSlice = createSlice({
  name: 'daylyConsumption',
  initialState: daylyConsumptionInitialState,
  reducers: {
    clearDaylyConsumptionErrors: (state) => {
      state.dailyConsumptionErrors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDailyConsumptionData.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          dailyDataIsLoading: false,
        };
      })
      .addCase(fetchAllDailyConsumptionData.rejected, (state, action) => {
        return {
          ...state,
          dailyDataIsLoading: false,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(fetchAllDailyConsumptionData.pending, (state, _action) => {
        return {
          ...state,
          dailyDataIsLoading: true,
        };
      })
      .addCase(setSettingDesiredDailyConsumption.fulfilled, (state, action) => {
        return {
          ...state,
          desiredDailyConsumption: action.payload,
        };
      })
      .addCase(setSettingDesiredDailyConsumption.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(addCoffeesConsumed.fulfilled, (state, action) => {
        const { newCoffeeAmount, newDesiredWaterConsumption } = action.payload;
        return {
          ...state,
          desiredDailyConsumption: newDesiredWaterConsumption,
          coffeesConsumed: newCoffeeAmount,
        };
      })
      .addCase(addCoffeesConsumed.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(addWaterConsumedSoFar.fulfilled, (state, action) => {
        const { newWaterAmount, newGlassesAmount } = action.payload;
        return {
          ...state,
          currentConsumtionMl: newWaterAmount,
          glassesOfWaterConsumed: newGlassesAmount,
        };
      })
      .addCase(addWaterConsumedSoFar.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(addWaterLevelSoFar.fulfilled, (state, action) => {
        return {
          ...state,
          waterLevel: action.payload,
        };
      })
      .addCase(addWaterLevelSoFar.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(resetDailyData.fulfilled, (state, action) => {
        return {
          ...state,
          desiredDailyConsumption: action.payload,
          waterLevel: daylyConsumptionInitialState.waterLevel,
          currentConsumtionMl: daylyConsumptionInitialState.currentConsumtionMl,
          coffeesConsumed: daylyConsumptionInitialState.coffeesConsumed,
          glassesOfWaterConsumed: daylyConsumptionInitialState.glassesOfWaterConsumed,
        };
      })
      .addCase(resetDailyData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(getHistoryData.fulfilled, (state, action) => {
        return {
          ...state,
          historyData: action.payload,
          historyDataisLoading: false,
        };
      })
      .addCase(getHistoryData.pending, (state, action) => {
        return {
          ...state,
          historyDataisLoading: true,
        };
      })
      .addCase(getHistoryData.rejected, (state, action) => {
        return {
          ...state,
          historyDataisLoading: false,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(get6MonthsHistoryData.fulfilled, (state, action) => {
        return {
          ...state,
          months6HistoryData: action.payload,
        };
      })
      .addCase(get6MonthsHistoryData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(getWeekHistoryData.fulfilled, (state, action) => {
        return {
          ...state,
          weekHistoryData: action.payload,
        };
      })
      .addCase(getWeekHistoryData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(getMonthHistoryData.fulfilled, (state, action) => {
        return {
          ...state,
          monthHistoryData: action.payload,
        };
      })
      .addCase(getMonthHistoryData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(get3MonthsHistoryData.fulfilled, (state, action) => {
        return {
          ...state,
          months3HistoryData: action.payload,
        };
      })
      .addCase(get3MonthsHistoryData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(getWeekAverageHistoryData.fulfilled, (state, action) => {
        return {
          ...state,
          weeklyAverageData: action.payload,
        };
      })
      .addCase(getWeekAverageHistoryData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(deleteOldHistoryRecords.fulfilled, (_state, _action) => {
        // nothing to do...
      })
      .addCase(deleteOldHistoryRecords.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      })
      .addCase(deleteAllHistoryData.fulfilled, (_state, _action) => {
        // nothing to do...
      })
      .addCase(deleteAllHistoryData.rejected, (state, action) => {
        return {
          ...state,
          dailyConsumptionErrors: [
            ...state.dailyConsumptionErrors,
            (action.payload as Error).message,
          ],
        };
      });
  },
});

export const { clearDaylyConsumptionErrors } = daylyConsumptionSlice.actions;

export const daylyConsumption = (state: RootState) => state.daylyConsumption;
export const selectHistoryData = (state: RootState, period: HistoryDataTimeFilter) => {
  switch (period) {
    case 'week':
      return state.daylyConsumption.weekHistoryData;
    case 'month':
      return state.daylyConsumption.monthHistoryData;
    case '3months':
      return state.daylyConsumption.months3HistoryData;
    case '6months':
      return state.daylyConsumption.months6HistoryData;
  }
};
const selectDailyConsumption = (state: RootState) => state.daylyConsumption;
export const selectMonthlyAverageData = (state: RootState, period: HistoryDataTimeFilter) => {
  if (period === 'month') {
    return state.daylyConsumption.weeklyAverageData;
  } else {
    return {};
  }
};

export const selectMonthlyAverageDataMemorized = createSelector(
  [selectDailyConsumption, selectMonthlyAverageData],
  (_daily, period) => period,
);

// export const { addConsumtion, addCoffee } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
