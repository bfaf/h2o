import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, DEFAULT_DAILY_CONSUMPTION, STORE_KEY_WATER_CONSUMED_SO_FAR, STORE_KEY_WATER_LEVEL_SO_FAR, STORE_KEY_COFFEES_CONSUMPTION, STORE_KEY_GLASSES_OF_WATER_CONSUMED, STORE_KEY_DAILY_CONSUMPTION } from "../../../../constants";
import { daylyConsumptionInitialState } from "../../slices/daylyConsumptionSlice";
import { RootState } from "../../store";
import { ColumnConfig, createTable, getDBConnection, getData, insertDataToTable } from "../../../../utils/db-service";
import { SQLiteDatabase } from "react-native-sqlite-storage";

const columnData: ColumnConfig[] = [
  {
    name: 'createdAt',
    type: 'INTEGER',
    canBeNull: false,
  },
  {
    name: 'currentConsumtionMl',
    type: 'INTEGER',
    canBeNull: false,
  },
];

export const resetDailyData = createAsyncThunk(
  'daylyConsumption/resetValue',
  async (thunkAPI, { rejectWithValue }) => {
    let db;
    try {
      let value = await AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION);
      if (value != null) {
        await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '' + value);
      } else {
        value = daylyConsumptionInitialState.desiredDailyConsumption.toString();
        await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, daylyConsumptionInitialState.desiredDailyConsumption.toString());
      }
      db = await getDBConnection();
      const data = {
        createdAt: Date.now(),
        currentConsumtionMl: value,
      };

      await Promise.all([
        await insertDataToTable(db, 'history', data),
        AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, daylyConsumptionInitialState.currentConsumtionMl.toString()),
        AsyncStorage.setItem(STORE_KEY_WATER_LEVEL_SO_FAR, daylyConsumptionInitialState.waterLevel.toString()),
        AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, daylyConsumptionInitialState.coffeesConsumed.toString()),
        AsyncStorage.setItem(STORE_KEY_GLASSES_OF_WATER_CONSUMED, daylyConsumptionInitialState.glassesOfWaterConsumed.toString())
      ]);

      return Number(value);
    } catch (err) {
      return rejectWithValue(err);
    } finally {
      db?.close();
    };
  }
);

const insertTestData = async (db: SQLiteDatabase) => {
  await insertDataToTable(db, 'history', {
    createdAt: new Date(2024, 2, 10, 10, 0, 0).getTime(),
    currentConsumtionMl: 3000});
  await insertDataToTable(db, 'history', {
    createdAt: new Date(2023, 1, 20, 9, 15, 34).getTime(),
    currentConsumtionMl: 2100});
  await insertDataToTable(db, 'history', {
    createdAt: new Date(2023, 10, 10, 8, 0, 0).getTime(),
    currentConsumtionMl: 4500});
  const results = await getData(db, 'history', columnData);
  console.log('results', results.length);
  results.forEach(result => {
    for (let index = 0; index < result.rows.length; index++) {
      console.log(JSON.stringify(result.rows.item(index), null, 2));
    }
  });
}

export const fetchAllDailyConsumptionData = createAsyncThunk(
  'daylyConsumption/fetchAllDailyConsumptionData',
  async (thunkAPI, { rejectWithValue }) => {
    let db;
    try {
      db = await getDBConnection();
      const values = await Promise.all([
        AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE),
        AsyncStorage.getItem(STORE_KEY_WATER_CONSUMED_SO_FAR),
        AsyncStorage.getItem(STORE_KEY_WATER_LEVEL_SO_FAR),
        AsyncStorage.getItem(STORE_KEY_COFFEES_CONSUMPTION),
      ]);
      if (values.every(val => val != null)) {
        // console.log('All values found');
        // values.forEach((v, i) => console.log(i, v));
        return {
          currentConsumtionMl: Number(values[1]),
          desiredDailyConsumption: Number(values[0]),
          coffeesConsumed: Number(values[3]),
          glassesOfWaterConsumed: 0,
          waterLevel: Number(values[2]),
          dailyConsumptionErrors: [],
        };
      } else {
        await Promise.all([
          AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION, daylyConsumptionInitialState.desiredDailyConsumption.toString()),
          AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, daylyConsumptionInitialState.desiredDailyConsumption.toString()),
          AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, daylyConsumptionInitialState.currentConsumtionMl.toString()),
          AsyncStorage.setItem(STORE_KEY_WATER_LEVEL_SO_FAR, daylyConsumptionInitialState.waterLevel.toString()),
          AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, daylyConsumptionInitialState.coffeesConsumed.toString())
        ]);
        await createTable(db, 'history', columnData);
        await insertTestData(db);
      
        return daylyConsumptionInitialState;
      }
    } catch (err) {
      return rejectWithValue(err);
    } finally {
      db?.close();
    };
  });

export const setSettingDesiredDailyConsumption = createAsyncThunk(
  'daylyConsumption/setDesiredDailyConsumptionValue',
  async (value: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const valueWithCoffee = value + (state.daylyConsumption.coffeesConsumed * state.settings.waterPerCoffeeCup);
      await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION, valueWithCoffee.toString());
      await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, valueWithCoffee.toString());
      return value;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addCoffeesConsumed = createAsyncThunk(
  'daylyConsumption/addCoffeesConsumedValue',
  async (value: number, { rejectWithValue }) => {
    try {
      const desiredWaterConsumption = await AsyncStorage.getItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE) || 0;
      const newDesiredWaterConsumption = (Number(desiredWaterConsumption) + value);
      await AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '' + newDesiredWaterConsumption);

      const coffees = await AsyncStorage.getItem(STORE_KEY_COFFEES_CONSUMPTION) || 0;
      const newCoffeeAmount = (Number(coffees) + 1);
      await AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, '' + newCoffeeAmount);

      return { newCoffeeAmount, newDesiredWaterConsumption };
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
