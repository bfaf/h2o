import { GetThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import { ResultSet, SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { RootState } from '../stores/redux/store';
enablePromise(true);

export type ColumnConfig = {
    name: string,
    type: string,
    canBeNull: boolean;
}

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
    return openDatabase({ name: 'h2o.db', location: 'default' });
};

export const getData = async (db: SQLiteDatabase, tableName: string, columnConfig: ColumnConfig[]) => {
    const columns = columnConfig.map(({ name }) => name).join(', ');

    return await db.executeSql(`SELECT rowid as id, ${columns} FROM ${tableName}`);
};

export const createTable = async (db: SQLiteDatabase, tableName: string, columnConfig: ColumnConfig[]) => {
    // create table if not exists
    const columns = columnConfig.map((column) => `${column.name} ${column.type} ${column.canBeNull ? '' : 'NOT NULL'}`).join(', ');
    const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
          ${columns}
      );`;

    await db.executeSql(query);
};

export const deleteTable = async (db: SQLiteDatabase, tableName: string) => {
    const query = `DROP TABLE IF EXISTS ${tableName};`;

    await db.executeSql(query);
};

export const insertDataToTable = async (db: SQLiteDatabase, tableName: string, data: Record<string, any>) => {
    const columns = ['rowid'];
    const values = ['0'];
    let key: keyof (typeof data);
    for (key in data) {
        columns.push(key.toString());
        if (typeof (data[key]) === 'boolean') {
            values.push(`${data[key] === true ? 1 : 0}`);
        } else if (typeof (data[key]) === 'string') {
            values.push(`'${data[key]}'`);
        } else if (data[key].toString().indexOf(',') >= 0) {
            values.push(`'${JSON.stringify(data[key])}'`);
        } else if (data[key].toString().length === 0) {
            values.push("''");
        } else {
            values.push(`${data[key]}`);
        }
    }
    const insertQuery =
        `INSERT OR REPLACE INTO ${tableName}(${columns.join(',')}) values(` + values.join(',') + ')';

    return db.executeSql(insertQuery);
};

export const shouldPopulateInitially = (results: [ResultSet]) => results[0].rows.length === 0;

export const updateValue = async <T>(value: any, prop: keyof T, stateProp: keyof RootState, tableName: string, { getState, rejectWithValue }: GetThunkAPI<any>) => {
    let db = undefined;
    try {
        db = await getDBConnection();
        const state = getState() as RootState;
        const newValues = {
            ...state[stateProp],
            [prop]: value
        };
        await insertDataToTable(db, tableName, newValues);
        return value;
    } catch (err) {
        return rejectWithValue(err);
    } finally {
        db?.close();
    }
};
