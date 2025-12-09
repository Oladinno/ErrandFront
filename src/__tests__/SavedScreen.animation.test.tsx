import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SavedScreen from '../../src/screens/SavedScreen';
import { Animated } from 'react-native';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({
    spots: [
      { id: 's1', title: 'Spot 1', category: 'Restaurant', image: undefined, rating: 4.0, deliveryTime: '10 mins', isFavorite: true, deliveryFee: 1200, promoBadge: null },
    ],
    professionals: [{ id: 'p1', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 }],
    savedProfessionalIds: ['p1'],
    jobs: [{ id: 'j1', title: 'Fix sink', category: 'Plumber', status: 'saved', description: 'Leak under sink.' }],
    toggleSpotFavorite: jest.fn(),
    updateJobStatus: jest.fn(),
    toggleSaveProfessional: jest.fn(),
  });
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('SavedScreen animations', () => {
  test('card press triggers Animated.spring on press in/out', () => {
    const spy = jest.spyOn(Animated, 'spring').mockImplementation((...args: any) => ({ start: () => {} } as any));
    const { getByLabelText } = render(<SavedScreen />);
    const card = getByLabelText('Spot 1');
    fireEvent(card, 'pressIn');
    fireEvent(card, 'pressOut');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
