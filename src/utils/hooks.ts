export const calculateIncrease = (value: number, desiredDailyConsumption: number, currentlyConsumedWater: number): number => {
    const totalHeight = 200;
    let calculated = ((value / desiredDailyConsumption) * totalHeight);
    if (value < 0) {
        calculated = ((value + currentlyConsumedWater) / (desiredDailyConsumption + (value * -1))) * totalHeight;
    } else {
        calculated = ((value + currentlyConsumedWater) / desiredDailyConsumption) * totalHeight;
    }
    if (calculated < 0) {
        // dispatch(addWaterLevelSoFar(0));
        return 0;
    }
    const waterLevel = totalHeight - calculated;
    if (waterLevel < 0) {
        // dispatch(addWaterLevelSoFar(0));
        return 0;
    } else {
        // dispatch(addWaterLevelSoFar(waterLevel));
        return waterLevel;
    }
}
