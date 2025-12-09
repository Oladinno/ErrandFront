import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { parentNavigate: jest.fn(), navigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ getParent: () => ({ navigate: __navMock.parentNavigate }), navigate: __navMock.navigate }), __navMock };
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
    orders: [{ id: 'o1', status: 'ongoing', items: [{ id: 'p1', name: 'Item', price: 1000, store: 'FoodCourt' }], total: 1000 }],
    spots: [{ id: 's1', title: 'Food Court', category: 'Restaurant', rating: 4.2, deliveryTime: '12-25 mins', isFavorite: false, deliveryFee: 1200, promoBadge: null }],
    jobs: [{ id: 'j1', title: 'Fix sink', category: 'Plumber', status: 'active' }],
    professionals: [{ id: 'p1', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 }],
    savedProfessionalIds: [],
    toggleSpotFavorite: jest.fn(),
    addToCart: jest.fn(),
    toggleSaveProfessional: jest.fn(),
  });
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('HomeScreen navigation', () => {
  test('service buttons navigate to My Jobs and Send a Package', () => {
    const { getByText, getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByText('Services'));
    fireEvent.press(getByLabelText('My Jobs'));
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.parentNavigate).toHaveBeenCalledWith('My Jobs');
    fireEvent.press(getByLabelText('Send a Package'));
    expect(__navMock.parentNavigate).toHaveBeenCalledWith('Send a Package');
  });

  test('Padi FAB opens Chat Detail and selects thread', () => {
    const { getByLabelText } = render(<HomeScreen />);
    const fab = getByLabelText('Open Padi chat');
    fireEvent.press(fab);
    const { __navMock } = require('@react-navigation/native');
    const { __msgMocks } = require('../../src/state/messagesStore');
    expect(__msgMocks.setSelectedThreadId).toHaveBeenCalledWith('t1');
    expect(__navMock.parentNavigate).toHaveBeenCalledWith('Messages', { screen: 'Chat Detail' });
  });

  test('filter buttons toggle selection style', () => {
    const { getByText, getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByText('Services'));
    fireEvent.press(getByLabelText('Filter Plumber'));
    fireEvent.press(getByLabelText('Filter All'));
  });
});
