import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { setSettingDesiredDailyConsumption, addCoffeesConsumed, addWaterConsumedSoFar, addWaterLevelSoFar, resetDailyData, fetchAllDailyConsumptionData } from "../thunks/dailyConsumption";

interface DailyConsumptionState {
  currentConsumtionMl: number;
  desiredDailyConsumption: number;
  coffeesConsumed: number;
  glassesOfWaterConsumed: number;
  waterLevel: number;
  dailyConsumptionErrors: SerializedError[];
  dailyDataIsLoading: boolean;
}

export const daylyConsumptionInitialState = {
  currentConsumtionMl: 0,
  desiredDailyConsumption: 3500,
  coffeesConsumed: 0,
  glassesOfWaterConsumed: 0,
  waterLevel: 200,
  dailyConsumptionErrors: [],
  dailyDataIsLoading: true,
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
  },
});

export const daylyConsumption = (state: RootState) => state.daylyConsumption;

// export const { addConsumtion, addCoffee } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
