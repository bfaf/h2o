import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const daylyConsumptionSlice = createSlice({
  name: "daylyConsumption",
  initialState: {
    currentConsumtionMl: 0
  },
  reducers: {
    addConsumtion(state, action: PayloadAction<number>) {
        state.currentConsumtionMl = action.payload;
    }
  }
});

export const { addConsumtion } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
