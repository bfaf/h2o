import { RootState } from "../src/stores/redux/store";
import { getCurrentDate } from "../src/utils/date";

type PreloadedStateOverloads = {
    daylyConsumptionOverloads?: any;
    settingsOverloads?: any;
    currentDateOverloads?: any;
};

export const getPreloadedState = ({ daylyConsumptionOverloads, settingsOverloads, currentDateOverloads }: PreloadedStateOverloads): RootState => {
    return {
        daylyConsumption: {
            currentConsumtionMl: 0,
            desiredDailyConsumption: 3500,
            coffeesConsumed: 0,
            glassesOfWaterConsumed: 0,
            waterLevel: 200,
            errors: null,
            ...daylyConsumptionOverloads
        },
        settings: {
            remindersToggleEnabled: true,
            waterPerCoffeeCup: 200,
            repeatInterval: 60,
            fromTime: new Date(2024, 1, 1, 9, 0, 0).toISOString(),
            toTime: new Date(2024, 1, 1, 18, 0, 0).toISOString(),
            femaleIcon: true,
            errors: null,
            ...settingsOverloads
        },
        currentDate: {
            currentDate: getCurrentDate(),
            ...currentDateOverloads
        }
    } as RootState;
};