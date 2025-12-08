import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import OrderTrackingScreen from '../../src/screens/OrderTrackingScreen';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MapView = ({ children, ...props }: any) => <View testID="map" {...props}>{children}</View>;
  const Marker = ({ children, ...props }: any) => <View testID="marker" {...props}>{children}</View>;
  const Polyline = ({ ...props }: any) => <View testID="polyline" {...props} />;
  return { __esModule: true, default: MapView, Marker, Polyline };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const navMock = { navigate: jest.fn() };
  return { ...actual, useRoute: () => ({ params: { orderId: 'o1' } }), useNavigation: () => ({ getParent: () => navMock }), __navMock: navMock };
});

jest.mock('../../src/state/store', () => {
  const orders = [
    { id: 'o1', status: 'ongoing', items: [{ id: 'p1', name: 'Item', price: 1000, store: 'FoodCourt' }], total: 1000, eta: '20 mins', tracking: 'preparing' },
  ];
  const useAppStore = (sel: any) => sel({ orders, setOrderTracking: jest.fn() });
  return { useAppStore };
});

describe('OrderTrackingScreen visual elements', () => {
  test('renders map and shows current stage with ETA and OrderID', () => {
    const { getByTestId, getByText } = render(<OrderTrackingScreen />);
    expect(getByTestId('map')).toBeTruthy();
    expect(getByTestId('polyline')).toBeTruthy();
    expect(getByText('Your order is being prepared')).toBeTruthy();
    expect(getByText(/Estimated arrival time is/i)).toBeTruthy();
    expect(getByText(/Order ID:/i)).toBeTruthy();
  });
});

describe('OrderTrackingScreen transitions and actions', () => {
  test('cycles to transit and shows rider section', () => {
    const { getByLabelText, getByText } = render(<OrderTrackingScreen />);
    const help = getByLabelText('Help');
    fireEvent(help, 'onLongPress');
    expect(getByText('Your order is on its way')).toBeTruthy();
    expect(getByLabelText('Chat')).toBeTruthy();
    expect(getByLabelText('Call')).toBeTruthy();
  });

  test('call action is disabled when phone invalid', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(true as any);
    const { getByLabelText } = render(<OrderTrackingScreen />);
    const help = getByLabelText('Help');
    fireEvent(help, 'onLongPress');
    const call = getByLabelText('Call');
    fireEvent.press(call);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('cycles to delivered and shows delivered text', () => {
    const { getByLabelText, getByText } = render(<OrderTrackingScreen />);
    const help = getByLabelText('Help');
    fireEvent(help, 'onLongPress');
    fireEvent(help, 'onLongPress');
    expect(getByText('Your order has been delivered')).toBeTruthy();
  });

  test('cycles to created and shows sent to store text', () => {
    const { getByLabelText, getByText } = render(<OrderTrackingScreen />);
    const help = getByLabelText('Help');
    fireEvent(help, 'onLongPress');
    fireEvent(help, 'onLongPress');
    fireEvent(help, 'onLongPress');
    expect(getByText(/Your order has been sent to/i)).toBeTruthy();
  });

  test('summary button navigates to RecentOrders', () => {
    const { getByLabelText } = render(<OrderTrackingScreen />);
    const btn = getByLabelText('See Order Summary');
    fireEvent.press(btn);
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.navigate).toHaveBeenCalledWith('App', { screen: 'RecentOrders' });
  });
});
