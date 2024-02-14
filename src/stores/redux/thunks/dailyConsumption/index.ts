import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, DEFAULT_DAILY_CONSUMPTION, STORE_KEY_WATER_CONSUMED_SO_FAR, STORE_KEY_WATER_LEVEL_SO_FAR, STORE_KEY_COFFEES_CONSUMPTION, STORE_KEY_GLASSES_OF_WATER_CONSUMED, STORE_KEY_DAILY_CONSUMPTION } from "../../../../constants";
import { HistoryData, daylyConsumptionInitialState } from "../../slices/daylyConsumptionSlice";
import { RootState } from "../../store";
import { ColumnConfig, createTable, getDBConnection, getData, insertDataToTable, insertDataToTableTransactional } from "../../../../utils/db-service";
import { SQLiteDatabase } from "react-native-sqlite-storage";
import { FormatFn } from "../../../../utils/hooks";

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
      await closeDbConnection(db, rejectWithValue);
    };
  }
);

const insertTestData = async (db: SQLiteDatabase) => {
  const startTimestamp = Date.now();
  const data: HistoryData[] = [];
  const maxDays = (6 * 30);
  const dayOffset = 86400 * 1000;
  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  for (let i = 1; i <= maxDays; i++) {
    data.push({
      createdAt: (startTimestamp - (i * dayOffset)),
      currentConsumtionMl: getRandomInt(0, 3500),
    });
  }

  await db.transaction(tx => {
    data.forEach((d) => {
      insertDataToTableTransactional(tx, 'history', d);
    });
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
          createTable(db, 'history', columnData),
          insertTestData(db),
          AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION, daylyConsumptionInitialState.desiredDailyConsumption.toString()),
          AsyncStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, daylyConsumptionInitialState.desiredDailyConsumption.toString()),
          AsyncStorage.setItem(STORE_KEY_WATER_CONSUMED_SO_FAR, daylyConsumptionInitialState.currentConsumtionMl.toString()),
          AsyncStorage.setItem(STORE_KEY_WATER_LEVEL_SO_FAR, daylyConsumptionInitialState.waterLevel.toString()),
          AsyncStorage.setItem(STORE_KEY_COFFEES_CONSUMPTION, daylyConsumptionInitialState.coffeesConsumed.toString())
        ]);

        return daylyConsumptionInitialState;
      }
    } catch (err) {
      return rejectWithValue(err);
    } finally {
      await closeDbConnection(db, rejectWithValue);
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

export const getDataSubset = (historyData: any[], entries: number) => {
    const data = [];
    const limit = entries === 180 ? 0 : (historyData.length - entries)
    for (let i = historyData.length - 1; i >= limit; i--) {
        data.push(historyData[i]);
    }
    data.reverse();

    return data[0] ? data : [];
};

export const getFormatedData = (historyData: any, entries: number, formatFn: (timestamp: number) => FormatFn) => {
  const data = getDataSubset(historyData, entries);
  const weekNumbers: string[] = [];
  return data.map(d => {
    const weekNumber = formatFn(d.createdAt);
    if (weekNumbers.includes(weekNumber.key)) {
      return {
        value: d.currentConsumtionMl,
        hideDataPoint: true,
      };
    } else {
      weekNumbers.push(weekNumber.key);
      return {
        value: d.currentConsumtionMl,
        label: weekNumber.display
      };
    }
  });
};

export const getWeekHistoryData = createAsyncThunk(
  'daylyConsumption/getWeekHistoryData',
  async (historyData: any[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const date = d.toLocaleDateString('en-UK', { weekday: 'short' }).replace(/,.+/, '');

        return { key: date, display: date };
      }

      return {
        data: getFormatedData(historyData, 7, formatFn),
        spacing: 45,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getMonthHistoryData = createAsyncThunk(
  'daylyConsumption/getMonthHistoryData',
  async (historyData: any[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const onejan = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        const display = d.toLocaleDateString('en-UK', { day: '2-digit', month: 'short' });
        return { key: `W${weekNum}`, display };
      }

      return {
        data: getFormatedData(historyData, 30, formatFn),
        spacing: 11,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const get3MonthsHistoryData = createAsyncThunk(
  'daylyConsumption/get3MonthsHistoryData',
  async (historyData: any[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const formated = d.toLocaleDateString('en-UK', { month: 'short' });
        return { key: formated, display: formated };
      };

      return {
        data: getFormatedData(historyData, 90, formatFn),
        spacing: 4,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const get6MonthsHistoryData = createAsyncThunk(
  'daylyConsumption/get6MonthsHistoryData',
  async (historyData: any[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const formated = d.toLocaleDateString('en-UK', { month: 'short' });
        return { key: formated, display: formated };
      };

      return {
        data: getFormatedData(historyData, 180, formatFn),
        spacing: 2,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getHistoryData = createAsyncThunk(
  'daylyConsumption/getHistoryData',
  async (_value: number, { dispatch, rejectWithValue }) => {
    let db;
    let result: HistoryData[] = [];
    try {
      db = await getDBConnection();
      const data = await getData(db, 'history', columnData);
      data.forEach(res => {
        for (let i = 0; i < res.rows.length; i++) {
          result.push(res.rows.item(i));
        }
      });
      // result.forEach((r, i) => {
      //   console.log(`${i} = ${r.createdAt}, ${r.currentConsumtionMl}`);
      // });
      result.sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1;
        if (a.createdAt < b.createdAt) return -1;
        return 0;
      });
      return result;
    } catch (err) {
      return rejectWithValue(err);
    } finally {
      await closeDbConnection(db, rejectWithValue);
      dispatch(get6MonthsHistoryData(result));
      dispatch(get3MonthsHistoryData(result));
      dispatch(getMonthHistoryData(result));
      dispatch(getWeekHistoryData(result));
    };
  }
);

const closeDbConnection = async (db: SQLiteDatabase | undefined, rejectWithValue: any) => {
  try {
    await db?.close();
  } catch (error) {
    return rejectWithValue(error);
  }
};