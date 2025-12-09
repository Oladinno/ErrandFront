import React from 'react';
import { render } from '@testing-library/react-native';
import SavedScreen from '../../src/screens/SavedScreen';
import * as RN from 'react-native';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({
    spots: [
      { id: 's1', title: 'Spot 1', category: 'Restaurant', image: undefined, rating: 4.0, deliveryTime: '10 mins', isFavorite: true, deliveryFee: 1200, promoBadge: null },
      { id: 's2', title: 'Spot 2', category: 'Cafe', image: undefined, rating: 4.5, deliveryTime: '20 mins', isFavorite: true, deliveryFee: 1500, promoBadge: null },
    ],
    professionals: [],
    savedProfessionalIds: [],
    jobs: [],
    toggleSpotFavorite: jest.fn(),
    updateJobStatus: jest.fn(),
    toggleSaveProfessional: jest.fn(),
  });
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('SavedScreen responsive grid', () => {
  test('two columns on wide screens', () => {
    jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 800, height: 600, scale: 1, fontScale: 1 } as any);
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('restaurants-grid')).toBeTruthy();
  });

  test('one column on narrow screens', () => {
    jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 320, height: 600, scale: 1, fontScale: 1 } as any);
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('restaurants-grid')).toBeTruthy();
  });
});

