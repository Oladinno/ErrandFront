import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  // @ts-ignore
  if (console.error && (console.error as any).mockRestore) (console.error as any).mockRestore();
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/messagesStore', () => {
  const __msgMocks = { setSelectedThreadId: jest.fn() };
  const useMessagesStore = (sel: any) => sel({ setSelectedThreadId: __msgMocks.setSelectedThreadId });
  return { useMessagesStore, __msgMocks };
});

jest.mock('react-native-safe-area-context', () => {
  const SafeAreaView = ({ children }: any) => children;
  const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
  return { SafeAreaView, useSafeAreaInsets };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({
    cart: [],
    orders: [
      { id: 'o1', status: 'ongoing', items: [{ id: 'p1', name: 'Item', price: 1000, store: 'FoodCourt' }], total: 1000 },
    ],
    jobs: [
      { id: 'j1', title: 'Fix sink', category: 'Plumber', status: 'active' },
    ],
    spots: [
      { id: 's1', title: 'Food Court', category: 'Restaurant', image: undefined, rating: 4.2, deliveryTime: '12-25 mins', isFavorite: false, deliveryFee: 1200, promoBadge: null },
    ],
    professionals: [
      { id: 'p1', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 },
    ],
    savedProfessionalIds: [],
    toggleSpotFavorite: jest.fn(),
    toggleSaveProfessional: jest.fn(),
    addToCart: jest.fn(),
  });
  return { useAppStore };
});

describe('HomeScreen Padi FAB navigation', () => {
  test('taps Padi FAB navigates to Chat Detail and sets thread', () => {
    const { getByLabelText } = render(<HomeScreen />);
    const fab = getByLabelText('Open Padi chat');
    fireEvent.press(fab);
    const { __msgMocks } = require('../../src/state/messagesStore');
    const { __navMock } = require('@react-navigation/native');
    expect(__msgMocks.setSelectedThreadId).toHaveBeenCalledWith('t1');
    expect(__navMock.parentNavigate).toHaveBeenCalledWith('Messages', { screen: 'Chat Detail' });
  });
});
