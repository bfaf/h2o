import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchCurrentDate, setCurrentDate } from "../thunks/currentDate";

interface CurrentDateState {
    currentDate: string;
}

const currentDateSlice = createSlice({
    name: "currentDate",
    initialState: {
        currentDate: '',
    } as CurrentDateState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchCurrentDate.fulfilled, (state, action) => {
            state.currentDate = action.payload;
        })
        .addCase(setCurrentDate.fulfilled, (state, action) => {
            state.currentDate = action.payload;
        })
    }
});

export const currentDateSelector = (state: RootState) => state.currentDate;
export default currentDateSlice.reducer;
