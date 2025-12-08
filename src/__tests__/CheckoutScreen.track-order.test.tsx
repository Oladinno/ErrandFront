import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckoutScreen from '../../src/screens/CheckoutScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const navMock = { navigate: jest.fn() };
  return {
    ...actual,
    useNavigation: () => navMock,
    __navMock: navMock,
  };
});

jest.mock('../../src/state/store', () => {
  const orders: any[] = [];
  const cart = [
    { id: 'p1', name: 'Item', price: 1000, qty: 1 },
  ];
  let createdId: string | null = null;
  const placeOrderFromCart = jest.fn(() => {
    createdId = 'o123';
    orders.unshift({ id: createdId, status: 'ongoing', items: cart, total: 1000, tracking: 'created' });
    return createdId;
  });
  const hydrateCart = jest.fn();
  const hydrateOrders = jest.fn();
  const hydrateJobs = jest.fn();
  const useAppStore = (sel: any) => sel({ cart, placeOrderFromCart, orders, hydrateCart, hydrateOrders, hydrateJobs });
  return { useAppStore };
});

describe('CheckoutScreen track order', () => {
  test('navigates to OrderTracking after Pay and pressing Track Order', async () => {
    const { getByLabelText, findByLabelText } = render(<CheckoutScreen />);
    const payBtn = getByLabelText('Pay');
    fireEvent.press(payBtn);
    const trackBtn = await findByLabelText('Track Order');
    fireEvent.press(trackBtn);
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.navigate).toHaveBeenCalledWith('App', { screen: 'OrderTracking', params: { orderId: 'o123' } });
  });
});
