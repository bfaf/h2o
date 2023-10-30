import { createSlice, PayloadAction, createAsyncThunk, SerializedError } from "@reduxjs/toolkit"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_DAILY_CONSUMPTION, DEFAULT_WATER_INCREASE_WHEN_COFFEE_ADDED, STORE_KEY_COFFEES_CONSUMPTION, STORE_KEY_DAILY_CONSUMPTION, STORE_KEY_GLASSES_OF_WATER_CONSUMED, STORE_KEY_WATER_CONSUMED_SO_FAR } from "../../../constants";

interface DailyConsumptionState {
  currentConsumtionMl: number;
  desiredDailyConsumption: number;
  coffeesConsumed: number;
  glassesOfWaterConsumed: number;
  errors: SerializedError | null;
}

export const fetchSettingDesiredDailyConsumption = createAsyncThunk(
  'daylyConsumption/fetchDesiredDailyConsumptionValue',
  async (thunkAPI, { rejectWithValue }) => {
    try {
      const value = await AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION);
      if (value != null) {
        return Number(value);
      } else {
        // default value
        return DEFAULT_DAILY_CONSUMPTION;
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const setSettingDesiredDailyConsumption = createAsyncThunk(
  'daylyConsumption/setDesiredDailyConsumptionValue',
  async (value: number, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION, '' + value);
      return value;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addCoffeesConsumed = createAsyncThunk(
  'daylyConsumption/addCoffeesConsumedValue',
  async (thunkApi, { rejectWithValue }) => {
    try {
      const coffees = await AsyncStorage.getItem(STORE_KEY_COFFEES_CONSUMPTION) || 0;
      const newCoffeeAmount = (Number(coffees) + 1);
      await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION, '' + newCoffeeAmount);
      return newCoffeeAmount;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addGlassesOfWaterConsumed = createAsyncThunk(
  'daylyConsumption/addGlassesOfWaterConsumedValue',
  async (thunkApi, { rejectWithValue }) => {
    try {
      const glasses = await AsyncStorage.getItem(STORE_KEY_GLASSES_OF_WATER_CONSUMED) || 0;
      const newGlassesAmount = (Number(glasses) + 1);
      await AsyncStorage.setItem(STORE_KEY_GLASSES_OF_WATER_CONSUMED, '' + newGlassesAmount);
      return newGlassesAmount;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addWaterConsumedSoFar = createAsyncThunk(
  'daylyConsumption/addWaterConsumedSoFarValue',
  async (value: number, { rejectWithValue }) => {
    try {
      const water = await AsyncStorage.getItem(STORE_KEY_WATER_CONSUMED_SO_FAR) || 0;
      const newWaterAmount = (Number(water) + value);
      await AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, '' + water);
      return newWaterAmount;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const daylyConsumptionSlice = createSlice({
  name: "daylyConsumption",
  initialState: {
    currentConsumtionMl: 0,
    desiredDailyConsumption: 3000,
    coffeesConsumed: 0,
    glassesOfWaterConsumed: 0,
    errors: null,
  } as DailyConsumptionState,
  reducers: {
    addConsumtion(state, action: PayloadAction<number>) {
        state.currentConsumtionMl += action.payload;
        state.glassesOfWaterConsumed += 1;
    },
    addCoffee(state) {
      // When adding coffee temporarily increase daily water consumption
      state.desiredDailyConsumption += DEFAULT_WATER_INCREASE_WHEN_COFFEE_ADDED;
    }
  },
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
  },
});

export const { addConsumtion, addCoffee } = daylyConsumptionSlice.actions;
export default daylyConsumptionSlice.reducer;
