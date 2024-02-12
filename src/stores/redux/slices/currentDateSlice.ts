import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchCurrentDate, setCurrentDate } from "../thunks/currentDate";
import { getCurrentDate } from "../../../utils/utils";

export interface CurrentDateState {
    currentDate: string;
}

export const currentDateInitialState = {
    currentDate: getCurrentDate(),
} as CurrentDateState;

const currentDateSlice = createSlice({
    name: "currentDate",
    initialState: currentDateInitialState,
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
