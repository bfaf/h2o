import { describe, it, expect, jest } from '@jest/globals';
import { calculateIncrease } from '../../src/utils/hooks';

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