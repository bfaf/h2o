import { createSelector, createSlice, SerializedError } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { setSettingDesiredDailyConsumption, addCoffeesConsumed, addWaterConsumedSoFar, addWaterLevelSoFar, resetDailyData, fetchAllDailyConsumptionData, getHistoryData, get6MonthsHistoryData, getWeekHistoryData, getMonthHistoryData, get3MonthsHistoryData, getWeekAverageHistoryData } from "../thunks/dailyConsumption";
import { BarData, HistoryDataConfig, HistoryDataTimeFilter } from "../../../utils/hooks";

export type HistoryData = {
  createdAt: number, // unix timestamp
  currentConsumtionMl: number;
};

export interface DailyConsumptionState {
  currentConsumtionMl: number;
  desiredDailyConsumption: number;
  coffeesConsumed: number;
  glassesOfWaterConsumed: number;
  waterLevel: number;
  dailyConsumptionErrors: SerializedError[];
  dailyDataIsLoading: boolean;
  historyData: Array<HistoryData>;
  weekHistoryData: HistoryDataConfig;
  monthHistoryData: HistoryDataConfig;
  months3HistoryData: HistoryDataConfig;
  months6HistoryData: HistoryDataConfig;
  weeklyAverageData: Record<string, BarData>;
}

export const daylyConsumptionInitialState = {
  currentConsumtionMl: 0,
  desiredDailyConsumption: 3500,
  coffeesConsumed: 0,
  glassesOfWaterConsumed: 0,
  waterLevel: 200,
  dailyConsumptionErrors: [],
  dailyDataIsLoading: true,
  historyData: [],
  weekHistoryData: { data: [], spacing: 5},
  monthHistoryData: { data: [], spacing: 5},
  months3HistoryData: { data: [], spacing: 5},
  months6HistoryData: { data: [], spacing: 5},
  weeklyAverageData: {},
} as DailyConsumptionState;

const daylyConsumptionSlice = createSlice({
  name: "daylyConsumption",
  initialState: daylyConsumptionInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAllDailyConsumptionData.fulfilled, (state, action) => {
      const { desiredDailyConsumption, waterLevel, currentConsumtionMl, coffeesConsumed, glassesOfWaterConsumed } = action.payload;
      state.desiredDailyConsumption = desiredDailyConsumption;
      state.waterLevel = waterLevel;
      state.currentConsumtionMl = currentConsumtionMl;
      state.coffeesConsumed = coffeesConsumed;
      state.glassesOfWaterConsumed = glassesOfWaterConsumed;
      state.dailyDataIsLoading = false;
    })
      .addCase(fetchAllDailyConsumptionData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
        state.dailyDataIsLoading = false;
      })
      .addCase(fetchAllDailyConsumptionData.pending, (state, _action) => {
        state.dailyDataIsLoading = true;
      })
      .addCase(setSettingDesiredDailyConsumption.fulfilled, (state, action) => {
        state.desiredDailyConsumption = action.payload;
      })
      .addCase(setSettingDesiredDailyConsumption.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(addCoffeesConsumed.fulfilled, (state, action) => {
        const { newCoffeeAmount, newDesiredWaterConsumption } = action.payload;
        state.desiredDailyConsumption = newDesiredWaterConsumption;
        // state.currentConsumtionMl = newWaterAmount;
        state.coffeesConsumed = newCoffeeAmount;
      })
      .addCase(addCoffeesConsumed.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(addWaterConsumedSoFar.fulfilled, (state, action) => {
        const { newWaterAmount, newGlassesAmount } = action.payload;
        state.currentConsumtionMl = newWaterAmount;
        state.glassesOfWaterConsumed = newGlassesAmount;
      })
      .addCase(addWaterConsumedSoFar.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(addWaterLevelSoFar.fulfilled, (state, action) => {
        state.waterLevel = action.payload;
      })
      .addCase(addWaterLevelSoFar.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(resetDailyData.fulfilled, (state, action) => {
        state.desiredDailyConsumption = action.payload;
        state.waterLevel = daylyConsumptionInitialState.waterLevel;
        state.currentConsumtionMl = daylyConsumptionInitialState.currentConsumtionMl;
        state.coffeesConsumed = daylyConsumptionInitialState.coffeesConsumed;
        state.glassesOfWaterConsumed = daylyConsumptionInitialState.glassesOfWaterConsumed;
      })
      .addCase(resetDailyData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(getHistoryData.fulfilled, (state, action) => {
        state.historyData = action.payload;
      })
      .addCase(getHistoryData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(get6MonthsHistoryData.fulfilled, (state, action) => {
        state.months6HistoryData = action.payload;
      })
      .addCase(get6MonthsHistoryData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(getWeekHistoryData.fulfilled, (state, action) => {
        // console.log('getWeekHistoryData', JSON.stringify(action.payload, null, 2));
        state.weekHistoryData = action.payload;
      })
      .addCase(getWeekHistoryData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(getMonthHistoryData.fulfilled, (state, action) => {
        state.monthHistoryData = action.payload;
      })
      .addCase(getMonthHistoryData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(get3MonthsHistoryData.fulfilled, (state, action) => {
        state.months3HistoryData = action.payload;
      })
      .addCase(get3MonthsHistoryData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
      .addCase(getWeekAverageHistoryData.fulfilled, (state, action) => {
        state.weeklyAverageData = action.payload;
      })
      .addCase(getWeekAverageHistoryData.rejected, (state, action) => {
        state.dailyConsumptionErrors = [
          ...state.dailyConsumptionErrors,
          action.error
        ];
      })
  },
});// getWeekAverageHistoryData 

export const daylyConsumption = (state: RootState) => state.daylyConsumption;
export const selectHistoryData = (state: RootState, period: HistoryDataTimeFilter) => {
  switch(period) {
    case 'week':
      return state.daylyConsumption.weekHistoryData;
    case 'month':
      return state.daylyConsumption.monthHistoryData;
    case '3months':
      return state.daylyConsumption.months3HistoryData;
    case '6months':
        return state.daylyConsumption.months6HistoryData;
  }
}
const selectDailyConsumption = (state: RootState) => state.daylyConsumption;
export const selectMonthlyAverageData = (state: RootState, period: HistoryDataTimeFilter) => {
  if (period === 'month') {
    return state.daylyConsumption.weeklyAverageData;
  } else {
    return {};
  }
};

export const selectMonthlyAverageDataMemorized = createSelector([selectDailyConsumption, selectMonthlyAverageData], (_daily, period) => period);

// export const { addConsumtion, addCoffee } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
