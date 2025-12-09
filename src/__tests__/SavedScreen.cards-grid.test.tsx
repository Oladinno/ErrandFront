import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as RN from 'react-native';
import SavedScreen from '../../src/screens/SavedScreen';
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  // @ts-ignore
  if (console.error && (console.error as any).mockRestore) (console.error as any).mockRestore();
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 800, height: 600, scale: 1, fontScale: 1 } as any);

jest.mock('../../src/state/store', () => {
  const __storeMocks = { toggleSpotFavorite: jest.fn(), updateJobStatus: jest.fn(), toggleSaveProfessional: jest.fn() };
  const useAppStore = (sel: any) => sel({
    spots: [
      { id: 's1', title: 'Spot 1', category: 'Restaurant', image: undefined, rating: 4.0, deliveryTime: '10 mins', isFavorite: true, deliveryFee: 1200, promoBadge: null },
      { id: 's2', title: 'Spot 2', category: 'Cafe', image: undefined, rating: 4.5, deliveryTime: '20 mins', isFavorite: true, deliveryFee: 1500, promoBadge: null },
    ],
    professionals: [{ id: 'p1', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 }],
    savedProfessionalIds: ['p1'],
    jobs: [{ id: 'j1', title: 'Fix sink', category: 'Plumber', status: 'saved', description: 'Leak under sink.' }],
    toggleSpotFavorite: __storeMocks.toggleSpotFavorite,
    updateJobStatus: __storeMocks.updateJobStatus,
    toggleSaveProfessional: __storeMocks.toggleSaveProfessional,
  });
  return { useAppStore, __storeMocks };
});

describe('SavedScreen cards grid', () => {
  test('renders restaurants grid with cards and supports actions', () => {
    const { getByTestId, getAllByText } = render(<SavedScreen />);
    expect(getByTestId('restaurants-grid')).toBeTruthy();
    const opens = getAllByText('Open');
    fireEvent.press(opens[0]);
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.navigate).toHaveBeenCalledWith('App', { screen: 'Store', params: { storeId: 's1' } });
    const unsaves = getAllByText('Unsave');
    fireEvent.press(unsaves[1]);
    const { __storeMocks } = require('../../src/state/store');
    expect(__storeMocks.toggleSpotFavorite).toHaveBeenCalledWith('s2');
  });

  test('collections grid renders and supports unsave', () => {
    const { getByLabelText, getByTestId, getAllByText } = render(<SavedScreen />);
    fireEvent.press(getByLabelText('collections'));
    expect(getByTestId('collections-grid')).toBeTruthy();
    const unsaves = getAllByText('Unsave');
    fireEvent.press(unsaves[0]);
    const { __storeMocks } = require('../../src/state/store');
    expect(__storeMocks.toggleSaveProfessional).toHaveBeenCalledWith('p1');
  });

  test('jobs grid renders and activate/unsave works', () => {
    const { getByLabelText, getByTestId, getByText } = render(<SavedScreen />);
    fireEvent.press(getByLabelText('jobs'));
    expect(getByTestId('jobs-grid')).toBeTruthy();
    fireEvent.press(getByText('Activate'));
    const { __storeMocks } = require('../../src/state/store');
    expect(__storeMocks.updateJobStatus).toHaveBeenCalledWith('j1', 'active');
    fireEvent.press(getByText('Unsave'));
    expect(__storeMocks.updateJobStatus).toHaveBeenCalledWith('j1', 'active');
  });
});
