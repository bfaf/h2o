import 'react-native';
import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../utils/test-utils';
import { NavigationContainer } from '@react-navigation/native';

import AppStack from '../src/app-stack';

import { Home } from '../src/screens/home';

describe('Home Screen', () => {
  it('Renders properly with 0 ml', () => {
    const { getByText } = renderWithProviders(<Home />);
    const result = getByText("0 ml");
    expect(result).toBeDefined();
  });

  it('Renders properly with 300 ml', () => {
    const { getByText } = renderWithProviders(<Home />, { preloadedState: { daylyConsumption: { currentConsumtionMl: 300, desiredDailyConsumption: 3000 } } });
    const result = getByText("300 ml");
    expect(result).toBeDefined();
  });
});

describe('App Stack', () => {
  it('renders the correct screen', async () => {
    const { getByText } = renderWithProviders(
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    );
    await waitFor(() => getByText('Home'));
  });
});
