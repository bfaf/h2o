export const getCurrentDate = (): string => {
    const today = new Date();
    const month = today.getMonth() < 10 ? `0${today.getMonth()}` : today.getMonth();
    return `${today.getFullYear()}${month}${today.getDate()}`;
};

export const calculateIncrease = (value: number, desiredDailyConsumption: number, currentlyConsumedWater: number): number => {
    const totalHeight = 200;
    let calculated = ((value / desiredDailyConsumption) * totalHeight);
    if (value < 0) {
        calculated = ((value + currentlyConsumedWater) / (desiredDailyConsumption + (value * -1))) * totalHeight;
    } else {
        calculated = ((value + currentlyConsumedWater) / desiredDailyConsumption) * totalHeight;
    }

    if (calculated < 0) {
        return 0;
    }
    const waterLevel = totalHeight - calculated;
    if (waterLevel < 0) {
        return 0;
    } else {
        return waterLevel;
    }
}

export const shouldReset = (currentDate: string, today: string): boolean => {
    if (today.length > 0 && currentDate.length > 0 && today !== currentDate) {
        return true;
    }

    return false;
};

export const shouldAddCoffee = (notifId: string | undefined): boolean => {
    const num = parseInt(notifId || '0');
    return isNaN(num);
};
