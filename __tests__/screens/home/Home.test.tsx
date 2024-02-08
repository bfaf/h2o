import 'react-native';
import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderWithProviders } from '../../../utils/test-utils';

import { Home } from '../../../src/screens/home';
import { getPreloadedState } from '../../../utils/utils';
import { fireEvent, within } from '@testing-library/react-native';

import AsynStorage from '@react-native-async-storage/async-storage';
import { STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE } from '../../../src/constants';

jest.useFakeTimers();

describe('Home Screen', () => {

  beforeEach(async () => {
    await AsynStorage.clear();
    await AsynStorage.setItem(STORE_KEY_DAILY_CONSUMPTION_WITH_COFFEE, '1000');
  });

  it('Renders properly with 0 ml', async () => {
    const { getByText } = renderWithProviders(<Home />);
    const result = getByText("0 ml");
    expect(result).toBeDefined();
  });

  it('Renders properly with 300 ml', async () => {
    const preloadedState = getPreloadedState({
      daylyConsumptionOverloads: {
        currentConsumtionMl: 300,
        desiredDailyConsumption: 1000
      }
    });
    const screen = renderWithProviders(<Home />, { preloadedState });
    const result = screen.getByText("300 ml");
    expect(result).toBeDefined();
  });

  it('Renders properly with multiple water additions', async () => {
    const preloadedState = getPreloadedState({
      daylyConsumptionOverloads: {
        currentConsumtionMl: 300,
        desiredDailyConsumption: 1000
      }
    });
    const screen = renderWithProviders(<Home />, { preloadedState });
    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ 200ml'));

    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ 300ml'));

    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ 500ml'));

    const result = await screen.findByTestId("currentConsumtionMlSoFar");
    const amount = await within(result).findByText('1000 ml');
    expect(amount).toBeDefined();
  });

  it('Renders properly when added 2 coffees', async () => {
    const preloadedState = getPreloadedState({
      daylyConsumptionOverloads: {
        desiredDailyConsumption: 1000,
        coffeesConsumed: 0
      }
    });
    const screen = renderWithProviders(<Home />, { preloadedState });

    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ Coffee'));

    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ Coffee'));
    
    const result = await screen.findByTestId("coffeesIncluded");
    const res = await within(result).findByText(/2.*included/);
    expect(res).toBeDefined();
    expect(within(await screen.findByTestId("desiredDailyConsumption")).getByText('1400 ml')).toBeDefined();
  });

  it('Renders properly with water and coffee additions', async () => {
    const preloadedState = getPreloadedState({
      daylyConsumptionOverloads: {
        currentConsumtionMl: 0,
        coffeesConsumed: 0,
        desiredDailyConsumption: 1000
      }
    });
    const screen = renderWithProviders(<Home />, { preloadedState });
    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ 200ml'));

    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ 300ml'));

    fireEvent.press(await screen.findByTestId('addLiquidButton'));
    fireEvent.press(await screen.findByText('+ Coffee'));

    const result = await screen.findByTestId("currentConsumtionMlSoFar");
    const amount = await within(result).findByText('500 ml');
    expect(amount).toBeDefined();

    expect(within(await screen.findByTestId("desiredDailyConsumption")).getByText('1200 ml')).toBeDefined();

    const coffees = await screen.findByTestId("coffeesIncluded");
    const res = await within(coffees).findByText(/1.*included/);
    expect(res).toBeDefined();
  });

});
