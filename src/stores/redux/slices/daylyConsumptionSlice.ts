import { createSlice, SerializedError } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchSettingDesiredDailyConsumption, setSettingDesiredDailyConsumption, fetchWaterConsumptionSoFar, fetchWaterLevelSoFar, fetchCoffeesConsumedSoFar, addCoffeesConsumed, addWaterConsumedSoFar, addWaterLevelSoFar, resetDailyData } from "../thunks/dailyConsumption";

interface DailyConsumptionState {
  currentConsumtionMl: number;
  desiredDailyConsumption: number;
  coffeesConsumed: number;
  glassesOfWaterConsumed: number;
  waterLevel: number;
  errors: SerializedError | null;
}

const daylyConsumptionSlice = createSlice({
  name: "daylyConsumption",
  initialState: {
    currentConsumtionMl: 0,
    desiredDailyConsumption: 3500,
    coffeesConsumed: 0,
    glassesOfWaterConsumed: 0,
    waterLevel: 200,
    errors: null,
  } as DailyConsumptionState,
  reducers: {},
  extraReducers: (builder) => { 
    builder.addCase(fetchSettingDesiredDailyConsumption.fulfilled, (state, action) => {
      state.desiredDailyConsumption = action.payload;
    })
    .addCase(fetchSettingDesiredDailyConsumption.rejected, (state, action) => {
      state.errors = action.error;
    })
    .addCase(setSettingDesiredDailyConsumption.fulfilled, (state, action) => {
      state.desiredDailyConsumption = action.payload;
    })
    .addCase(fetchWaterConsumptionSoFar.fulfilled, (state, action) => {
      state.currentConsumtionMl = action.payload;
    })
    .addCase(fetchWaterLevelSoFar.fulfilled, (state, action) => {
      state.waterLevel = action.payload;
    })
    .addCase(fetchCoffeesConsumedSoFar.fulfilled, (state, action) => {
      state.coffeesConsumed = action.payload;
    })
    .addCase(addCoffeesConsumed.fulfilled, (state, action) => {
      const { newCoffeeAmount, newDesiredWaterConsumption } = action.payload;
      state.desiredDailyConsumption = newDesiredWaterConsumption;
      // state.currentConsumtionMl = newWaterAmount;
      state.coffeesConsumed = newCoffeeAmount;
    })
    .addCase(addWaterConsumedSoFar.fulfilled, (state, action) => {
      const { newWaterAmount, newGlassesAmount } = action.payload;
      state.currentConsumtionMl = newWaterAmount;
      state.glassesOfWaterConsumed = newGlassesAmount;
    })
    .addCase(addWaterLevelSoFar.fulfilled, (state, action) => {
      state.waterLevel = action.payload;
    })
    .addCase(resetDailyData.fulfilled, (state, action) => {
      state.desiredDailyConsumption = action.payload;
      state.waterLevel = 200;
      state.currentConsumtionMl = 0;
      state.coffeesConsumed = 0;
      state.glassesOfWaterConsumed = 0;
    })
  },
});

export const daylyConsumption = (state: RootState) => state.daylyConsumption;

// export const { addConsumtion, addCoffee } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
