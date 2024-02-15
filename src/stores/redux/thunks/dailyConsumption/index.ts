import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, DEFAULT_DAILY_CONSUMPTION, STORE_KEY_WATER_CONSUMED_SO_FAR, STORE_KEY_WATER_LEVEL_SO_FAR, STORE_KEY_COFFEES_CONSUMPTION, STORE_KEY_GLASSES_OF_WATER_CONSUMED, STORE_KEY_DAILY_CONSUMPTION } from "../../../../constants";
import { HistoryData, daylyConsumptionInitialState } from "../../slices/daylyConsumptionSlice";
import { RootState } from "../../store";
import { ColumnConfig, clearHistoryData, createTable, deleteOldRecords, getDBConnection, getData, insertDataToTable, insertDataToTableTransactional } from "../../../../utils/db-service";
import { SQLiteDatabase } from "react-native-sqlite-storage";
import { BarData, FormatFn } from "../../../../utils/hooks";

const ONE_DAY = 86400 * 1000;
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
      let waterConsumptionSoFar = await AsyncStorage.getItem(STORE_KEY_WATER_CONSUMED_SO_FAR);
      if (waterConsumptionSoFar == null) {
        waterConsumptionSoFar = '0';
      }
      
      db = await getDBConnection();
      const data = {
        createdAt: (Date.now() - ONE_DAY),
        currentConsumtionMl: waterConsumptionSoFar,
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
  const dayOffset = ONE_DAY;
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
          // insertTestData(db),
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
  let limit = 0;
  if (entries === 180 || historyData.length < entries) {
    limit = 0
  } else {
    limit = historyData.length - entries;
  }

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
    } else if (weekNumber.display.length > 0) {
      weekNumbers.push(weekNumber.key);
      return {
        value: d.currentConsumtionMl,
        label: weekNumber.display
      };
    } else {
      return {
        value: d.currentConsumtionMl,
        hideDataPoint: true,
      };
    }
  });
};

export const getWeekAverageHistoryData = createAsyncThunk(
  'daylyConsumption/getWeekAverageHistoryData',
  async (historyData: HistoryData[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const date = d.toLocaleDateString('en-UK', { weekday: 'short' }).replace(/,.+/, '');

        return { key: date, display: date };
      }

      const days: Record<string, BarData> = {};
      const subset = getDataSubset(historyData, 30);
      subset.forEach(d => {
        const formated = formatFn(d.createdAt);
        if (days[formated.key]) {
          days[formated.key].allConsumtionMl = days[formated.key].allConsumtionMl + d.currentConsumtionMl;
          days[formated.key].total = days[formated.key].total + 1;
        } else {
          days[formated.key] = {
            allConsumtionMl: d.currentConsumtionMl,
            average: 0,
            total: 1
          }
        }
      });

      for (let day in days) {
        days[day].average = Math.round(days[day].allConsumtionMl / days[day].total);
      }
      if (Object.keys(days).length < 7) {
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
          if (!days[day]) {
            days[day] = {
              allConsumtionMl: 0,
              average: 0,
              total: 0
            }
          }
        });
      }

      return days;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getWeekHistoryData = createAsyncThunk(
  'daylyConsumption/getWeekHistoryData',
  async (historyData: HistoryData[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const date = d.toLocaleDateString('en-UK', { weekday: 'short' }).replace(/,.+/, '');

        return { key: date, display: date };
      }

      const data = getFormatedData(historyData, 7, formatFn);
      if (data.length < 7) {
        const weekNumbers: string[] = [];
        data.forEach((d) => {
          if (d.label) {
            weekNumbers.push(d.label);
          }
        });
        const today = Date.now();
        data.reverse();
        for (let i = data.length + 1; i <= 7; i++) {
          const timestamp = today - (i * ONE_DAY);
          const weekNumber = formatFn(timestamp);
          if (weekNumbers.includes(weekNumber.key)) {
            data.push({
              value: 0,
              hideDataPoint: true,
            });
          } else {
            weekNumbers.push(weekNumber.key);
            data.push({
              value: 0,
              label: weekNumber.display
            });
          }
        }
        data.reverse();
      }

      return {
        data,
        spacing: 45,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getMonthHistoryData = createAsyncThunk(
  'daylyConsumption/getMonthHistoryData',
  async (historyData: HistoryData[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const onejan = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((d.getTime() - onejan.getTime()) / ONE_DAY) + onejan.getDay() + 1) / 7);
        const display = d.getDay() === 1 ? d.toLocaleDateString('en-UK', { day: '2-digit', month: 'short' }) : '';
        return { key: `W${weekNum}`, display };
      }

      const data = getFormatedData(historyData, 30, formatFn);
      if (data.length < 30) {
        const weekNumbers: string[] = [];
        data.forEach((d) => {
          if (d.label) {
            weekNumbers.push(d.label);
          }
        });
        const today = Date.now();
        data.reverse();
        for (let i = data.length + 1; i <= 30; i++) {
          const timestamp = today - (i * ONE_DAY);
          const weekNumber = formatFn(timestamp);
          if (weekNumbers.includes(weekNumber.key)) {
            data.push({
              value: 0,
              hideDataPoint: true,
            });
          } else {
            weekNumbers.push(weekNumber.key);
            data.push({
              value: 0,
              label: weekNumber.display
            });
          }
        }
        data.reverse();
      }

      return {
        data,
        spacing: 9.5,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const get3MonthsHistoryData = createAsyncThunk(
  'daylyConsumption/get3MonthsHistoryData',
  async (historyData: HistoryData[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const formated = d.toLocaleDateString('en-UK', { month: 'short' });
        const display = d.getDate() === 1 ? d.toLocaleDateString('en-UK', { month: 'short' }) : '';
        return { key: formated, display };
      };

      const data = getFormatedData(historyData, 90, formatFn);
      if (data.length < 90) {
        const weekNumbers: string[] = [];
        data.forEach((d) => {
          if (d.label) {
            weekNumbers.push(d.label);
          }
        });
        const today = Date.now();
        data.reverse();
        for (let i = data.length + 1; i <= 90; i++) {
          const timestamp = today - (i * ONE_DAY);
          const weekNumber = formatFn(timestamp);
          if (weekNumbers.includes(weekNumber.key)) {
            data.push({
              value: 0,
              hideDataPoint: true,
            });
          } else {
            weekNumbers.push(weekNumber.key);
            data.push({
              value: 0,
              label: weekNumber.display
            });
          }
        }
        data.reverse();
      }

      return {
        data,
        spacing: 3.2,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const get6MonthsHistoryData = createAsyncThunk(
  'daylyConsumption/get6MonthsHistoryData',
  async (historyData: HistoryData[], { rejectWithValue }) => {
    try {
      const formatFn = (timestamp: number) => {
        const d = new Date(timestamp);
        const formated = d.toLocaleDateString('en-UK', { month: 'short' });
        const display = d.getDate() === 1 ? d.toLocaleDateString('en-UK', { month: 'short' }) : '';
        return { key: formated, display };
      };

      const data = getFormatedData(historyData, 180, formatFn);
      if (data.length < 180) {
        const weekNumbers: string[] = [];
        data.forEach((d) => {
          if (d.label) {
            weekNumbers.push(d.label);
          }
        });
        const today = Date.now();
        data.reverse();
        for (let i = data.length + 1; i <= 180; i++) {
          const timestamp = today - (i * ONE_DAY);
          const weekNumber = formatFn(timestamp);
          if (weekNumbers.includes(weekNumber.key)) {
            data.push({
              value: 0,
              hideDataPoint: true,
            });
          } else {
            weekNumbers.push(weekNumber.key);
            data.push({
              value: 0,
              label: weekNumber.display
            });
          }
        }
        data.reverse();
      }

      return {
        data,
        spacing: 1.6,
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteOldHistoryRecords = createAsyncThunk(
  'daylyConsumption/deleteOldHistoryRecords',
  async (_thunkAPI, { rejectWithValue }) => {
    try {
      await deleteOldRecords();
    }
    catch (error) {
      rejectWithValue(error);
    }
  }
);

export const getHistoryData = createAsyncThunk(
  'daylyConsumption/getHistoryData',
  async (_thunkAPI, { dispatch, rejectWithValue }) => {
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
      dispatch(getWeekAverageHistoryData(result));
      dispatch(getWeekHistoryData(result));
    };
  }
);

export const deleteAllHistoryData = createAsyncThunk(
  'daylyConsumption/deleteAllHistoryData',
  async (_thunkAPI, { dispatch, rejectWithValue }) => {
    try {
      await clearHistoryData();
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const closeDbConnection = async (db: SQLiteDatabase | undefined, rejectWithValue: any) => {
  try {
    await db?.close();
  } catch (error) {
    return rejectWithValue(error);
  }
};