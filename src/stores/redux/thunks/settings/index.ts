import { createAsyncThunk } from "@reduxjs/toolkit";

import {  settingsInitialState } from "../../slices/settingSlice";
import { getDBConnection, createTable, getData, insertDataToTable, ColumnConfig, shouldPopulateInitially } from "../../../../utils/db-service";
import { RootState } from "../../store";
import { updateSettings } from "../../../../utils/utils";

const TABLE_NAME = 'settings';

const columnConfig: ColumnConfig[] = [
    {
        name: 'remindersToggleEnabled',
        type: 'INTEGER',
        canBeNull: false
    },
    {
        name: 'waterPerCoffeeCup',
        type: 'INTEGER',
        canBeNull: false
    },
    {
        name: 'repeatInterval',
        type: 'INTEGER',
        canBeNull: false
    },
    {
        name: 'femaleIcon',
        type: 'INTEGER',
        canBeNull: false
    },
    {
        name: 'waterAmounts',
        type: 'TEXT',
        canBeNull: false
    },
    {
        name: 'fromTime',
        type: 'TEXT',
        canBeNull: false
    },
    {
        name: 'toTime',
        type: 'TEXT',
        canBeNull: false
    },
    {
        name: 'settingsErrors',
        type: 'TEXT',
        canBeNull: true
    },
    {
        name: 'settingsDataIsLoading',
        type: 'INTEGER',
        canBeNull: false
    },
];

export const setReminderSwitch = createAsyncThunk(
    'settings/setReminderSwitch',
    async (value: boolean, params) => {
        return await updateSettings(value, 'remindersToggleEnabled', params);
    }
);

export const setWaterPerCoffeeCup = createAsyncThunk(
    'settings/setWaterPerCoffeeCup',
    async (value: number, params) => {
        return await updateSettings(value, 'waterPerCoffeeCup', params);
    }
);

export const setRepeatInterval = createAsyncThunk(
    'settings/setRepeatInterval',
    async (value: number, params ) => {
        return await updateSettings(value, 'repeatInterval', params);
    }
);

export const setFromDate = createAsyncThunk(
    'settings/setFromDate',
    async (value: string, params) => {
        return await updateSettings(value, 'fromTime', params);
    }
);

export const setToDate = createAsyncThunk(
    'settings/setToDate',
    async (value: string, params) => {
        return await updateSettings(value, 'toTime', params);
    }
);

export const setHumanIcon = createAsyncThunk(
    'settings/setHumanIcon',
    async (value: boolean, params) => {
        return await updateSettings(value, 'femaleIcon', params);
    }
);

export const addWaterAmount = createAsyncThunk(
    'settings/addWaterAmount',
    async (waterAmount: string, params) => {
        const state = params.getState() as RootState;
        const newWaterAmounts = [...state.settings.waterAmounts];
        newWaterAmounts.push(waterAmount);
        return await updateSettings(newWaterAmounts, 'waterAmounts', params);
    }
);

export const removeWaterAmount = createAsyncThunk(
    'settings/removeWaterAmount',
    async (waterAmount: string, params) => {
        const state = params.getState() as RootState;
        const newWaterAmounts = state.settings.waterAmounts.filter((amount) => amount !== waterAmount);
        return await updateSettings(newWaterAmounts, 'waterAmounts', params);
    }
);

export const fetchAllSettings = createAsyncThunk(
    'settings/fetchAllSettings',
    async (_, { rejectWithValue }) => {
        let db;
        try {
            db = await getDBConnection();
            await createTable(db, TABLE_NAME, columnConfig);
            let results = await getData(db, TABLE_NAME, columnConfig);
            const populateInitially = shouldPopulateInitially(results);
            if (populateInitially) {
                await insertDataToTable(db, TABLE_NAME, settingsInitialState);
                results = await getData(db, TABLE_NAME, columnConfig);
            }

            const data = results[0].rows.item(0);
            const settings: typeof settingsInitialState = {
                remindersToggleEnabled: data['remindersToggleEnabled'] === 1,
                waterPerCoffeeCup: data['waterPerCoffeeCup'],
                repeatInterval: data['repeatInterval'],
                fromTime: data['fromTime'],
                toTime: data['toTime'],
                femaleIcon: data['femaleIcon'] === 1,
                waterAmounts: JSON.parse(data['waterAmounts']),
                settingsErrors: [],
                settingsDataIsLoading: data['settingsDataIsLoading'] === 1,
            };
            return settings;
        } catch (err) {
            return rejectWithValue(err);
        } finally {
            await db?.close();
        }
    }
);
