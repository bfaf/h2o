import { createSlice, PayloadAction } from "@reduxjs/toolkit"
// import AsyncStorage from '@react-native-async-storage/async-storage';

const daylyConsumptionSlice = createSlice({
  name: "daylyConsumption",
  initialState: {
    currentConsumtionMl: 0,
    desiredDailyConsumption: 3000,
  },
  reducers: {
    addConsumtion(state, action: PayloadAction<number>) {
        state.currentConsumtionMl += action.payload;
    },
    updateDesiredDailyConsumption(state, action: PayloadAction<number>) {
        state.desiredDailyConsumption = action.payload;
    }
  }
});

export const { addConsumtion } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
