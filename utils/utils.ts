import { currentDateInitialState } from "../src/stores/redux/slices/currentDateSlice";
import { daylyConsumptionInitialState } from "../src/stores/redux/slices/daylyConsumptionSlice";
import { settingsInitialState } from "../src/stores/redux/slices/settingSlice";
import { RootState } from "../src/stores/redux/store";

type PreloadedStateOverloads = {
    daylyConsumptionOverloads?: any;
    settingsOverloads?: any;
    currentDateOverloads?: any;
};

export const getPreloadedState = ({ daylyConsumptionOverloads, settingsOverloads, currentDateOverloads }: PreloadedStateOverloads): RootState => {
    return {
        daylyConsumption: {
            ...daylyConsumptionInitialState,
            ...daylyConsumptionOverloads
        },
        settings: {
            ...settingsInitialState,
            ...settingsOverloads
        },
        currentDate: {
            ...currentDateInitialState,
            ...currentDateOverloads
        }
    } as RootState;
};