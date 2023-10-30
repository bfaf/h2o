import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, DEFAULT_DAILY_CONSUMPTION, STORE_KEY_WATER_CONSUMED_SO_FAR, STORE_KEY_WATER_LEVEL_SO_FAR, STORE_KEY_COFFEES_CONSUMPTION, DEFAULT_WATER_INCREASE_WHEN_COFFEE_ADDED, STORE_KEY_GLASSES_OF_WATER_CONSUMED, STORE_KEY_DAILY_CONSUMPTION } from "../../../../constants";

export const resetDailyData = createAsyncThunk(
    'daylyConsumption/resetValue',
    async (thunkAPI, { rejectWithValue }) => {
      try {
        let value = await AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION);
        if (value != null) {
            await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '' + value);
        } else {
            value = '' + DEFAULT_DAILY_CONSUMPTION;
            await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '' + DEFAULT_DAILY_CONSUMPTION);
        }
        
        await AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, '' + 0);
        await AsyncStorage.setItem(STORE_KEY_WATER_LEVEL_SO_FAR, '' + 200);
        await AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, '' + 0);
        await AsyncStorage.setItem(STORE_KEY_GLASSES_OF_WATER_CONSUMED, '' + 0);

        return Number(value);
      } catch (err) {
        return rejectWithValue(err);
      }
    }
  );

export const fetchSettingDesiredDailyConsumption = createAsyncThunk(
    'daylyConsumption/fetchDesiredDailyConsumptionValue',
    async (thunkAPI, { rejectWithValue }) => {
      try {
        const value = await AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE);
        if (value != null) {
          return Number(value);
        } else {
          // default value
          await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION, '' + DEFAULT_DAILY_CONSUMPTION);
          await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '' + DEFAULT_DAILY_CONSUMPTION);
          return DEFAULT_DAILY_CONSUMPTION;
        }
      } catch (err) {
        return rejectWithValue(err);
      }
    }
  );
  
  export const fetchWaterConsumptionSoFar = createAsyncThunk(
    'daylyConsumption/fetchWaterConsumptionSoFarValue',
    async (thunkAPI, { rejectWithValue }) => {
      try {
        const value = await AsyncStorage.getItem(STORE_KEY_WATER_CONSUMED_SO_FAR);
        if (value != null) {
          return Number(value);
        } else {
          // default value
          await AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, '' + 0);
          return 0;
        }
      } catch (err) {
        return rejectWithValue(err);
      }
    }
  );
  
  export const fetchWaterLevelSoFar = createAsyncThunk(
    'daylyConsumption/fetchWaterLevelSoFarValue',
    async (thunkAPI, { rejectWithValue }) => {
      try {
        const value = await AsyncStorage.getItem(STORE_KEY_WATER_LEVEL_SO_FAR);
        if (value != null) {
          return Number(value);
        } else {
          // default value
          await AsyncStorage.setItem(STORE_KEY_WATER_LEVEL_SO_FAR, '' + 200);
          return 200;
        }
      } catch (err) {
        return rejectWithValue(err);
      }
    }
  );
  
  export const fetchCoffeesConsumedSoFar = createAsyncThunk(
    'daylyConsumption/fetchCoffeesConsumedSoFarValue',
    async (thunkAPI, { rejectWithValue }) => {
      try {
        const value = await AsyncStorage.getItem(STORE_KEY_COFFEES_CONSUMPTION);
        if (value != null) {
          return Number(value);
        } else {
          // default value
          await AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, '' + 0);
          return 0;
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
        const water = await AsyncStorage.getItem(STORE_KEY_WATER_CONSUMED_SO_FAR) || 0;
        const calculatedWaterAmount = (Number(water) - DEFAULT_WATER_INCREASE_WHEN_COFFEE_ADDED)
        const newWaterAmount = calculatedWaterAmount < 0 ? 0 : calculatedWaterAmount;
        await AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, '' + newWaterAmount);
  
        const desiredWaterConsumption = await AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE) || 0;
        const newDesiredWaterConsumption = (Number(desiredWaterConsumption) + DEFAULT_WATER_INCREASE_WHEN_COFFEE_ADDED);
        await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '' + newDesiredWaterConsumption);
  
        const coffees = await AsyncStorage.getItem(STORE_KEY_COFFEES_CONSUMPTION) || 0;
        const newCoffeeAmount = (Number(coffees) + 1);
        await AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, '' + newCoffeeAmount);
  
        return { newCoffeeAmount, newWaterAmount, newDesiredWaterConsumption };
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
        await AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, '' + newWaterAmount);
  
        const glasses = await AsyncStorage.getItem(STORE_KEY_GLASSES_OF_WATER_CONSUMED) || 0;
        const newGlassesAmount = (Number(glasses) + 1);
        await AsyncStorage.setItem(STORE_KEY_GLASSES_OF_WATER_CONSUMED, '' + newGlassesAmount);
  
        return { newWaterAmount, newGlassesAmount };
      } catch (err) {
        return rejectWithValue(err);
      }
    }
  );
  
  export const addWaterLevelSoFar = createAsyncThunk(
    'daylyConsumption/addWaterLevelSoFarValue',
    async (value: number, { rejectWithValue }) => {
      try {
        await AsyncStorage.setItem(STORE_KEY_WATER_LEVEL_SO_FAR, '' + value);
        return value;
      } catch (err) {
        return rejectWithValue(err);
      }
    }
  );
