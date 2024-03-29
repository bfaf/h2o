import { describe, it, expect, jest } from '@jest/globals';
import { calculateIncrease, shouldAddCoffee, shouldReset } from '../../src/utils/utils';


describe('calculateIncrease', () => {
    it('should caluclate half water level', () => {
        // max water level is 200 (height of the image)
        const amount = 500;
        const desiredDailyConsumption = 1000;
        const currentlyConsumedWater = 0;

        const calculated = calculateIncrease(amount, desiredDailyConsumption, currentlyConsumedWater);
        expect(calculated).toEqual(100);
    });

    it('should not go below max water level', () => {
        // maybe this test is wrong. Expecting to get 200
        const amount = -900;
        const desiredDailyConsumption = 1000;
        const currentlyConsumedWater = 800;

        const calculated = calculateIncrease(amount, desiredDailyConsumption, currentlyConsumedWater);
        expect(calculated).toEqual(0);
    });

    it('should not go above max water level', () => {
        const amount = 1500;
        const desiredDailyConsumption = 1000;
        const currentlyConsumedWater = 0;

        const calculated = calculateIncrease(amount, desiredDailyConsumption, currentlyConsumedWater);
        expect(calculated).toEqual(0);
    });

    it('should be max water level', () => {
        const amount = 1000;
        const desiredDailyConsumption = 1000;
        const currentlyConsumedWater = 0;

        const calculated = calculateIncrease(amount, desiredDailyConsumption, currentlyConsumedWater);
        expect(calculated).toEqual(0);
    });
});

describe('shouldAddCoffee', () => {
    it('adds coffee', () => {
        const result = shouldAddCoffee('coffee');
        expect(result).toBeTruthy();
    });

    it('adds water', () => {
        const result = shouldAddCoffee('200');
        expect(result).toBeFalsy();
    });
});

describe('shouldReset', () => {
    it ('resets the data', () => {
        const today = '2024018';
        const currentDate = '2024017';
        const result = shouldReset(currentDate, today);
        
        expect(result).toBeTruthy();
    });

    it ('does not resets the data', () => {
        const today = '2024018';
        const currentDate = '2024018';
        const result = shouldReset(currentDate, today);
        
        expect(result).toBeFalsy();
    });
});