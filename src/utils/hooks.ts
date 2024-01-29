import { addWaterLevelSoFar } from "../stores/redux/thunks/dailyConsumption";
import { AppDispatch } from "../stores/redux/store";

export const calculateIncrease = (value: number, desiredDailyConsumption: number, waterLevel: number, dispatch: AppDispatch) => {
    const totalHeight = 200;
    let calculated = ((value / desiredDailyConsumption) * totalHeight);
    if (value < 0) {
        calculated = ((value / (desiredDailyConsumption + 200)) * 100); // kind of correct expression
    }
    if (waterLevel - calculated < 0) {
        dispatch(addWaterLevelSoFar(0));
        return;
    }

    dispatch(addWaterLevelSoFar(waterLevel - calculated));
}
