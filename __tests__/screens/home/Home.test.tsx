import 'react-native';
import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { renderWithProviders } from '../../../utils/test-utils';

import { Home } from '../../../src/screens/home';
import { getPreloadedState } from '../../../utils/utils';
import { fireEvent, within } from '@testing-library/react-native';
jest.useFakeTimers();

describe('Home Screen', () => {
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

  it('Renders properly when added 2 coffees', async () => {
    const preloadedState = getPreloadedState({
      daylyConsumptionOverloads: {
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
    expect(within(await screen.findByTestId("desiredDailyConsumption")).getByText('400 ml')).toBeDefined();
  });

});
