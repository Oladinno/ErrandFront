import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import OrderTrackingScreen from '../../src/screens/OrderTrackingScreen';
import { Animated, Linking } from 'react-native';

jest.mock('react-native-maps', () => {
  const View = require('react-native').View;
  const MapView = ({ children }: any) => <View>{children}</View>;
  const Marker = ({ children }: any) => <View>{children}</View>;
  const Polyline = () => <View />;
  return { __esModule: true, default: MapView, MapView, Marker, Polyline };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn(), goBack: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }), goBack: __navMock.goBack }), useRoute: () => ({ params: { orderId: 'o1' } }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const __storeMocks = { setOrderTracking: jest.fn() };
  const useAppStore = (sel: any) => sel({
    orders: [{ id: 'o1', status: 'ongoing', items: [{ id: 'p1', name: 'Item', price: 1000, store: 'FoodCourt' }], total: 1000, eta: '12-25 mins', tracking: 'preparing' }],
    setOrderTracking: __storeMocks.setOrderTracking,
  });
  return { useAppStore, __storeMocks };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('OrderTrackingScreen interactions', () => {
  test('long press Help advances status and updates store', () => {
    const timingSpy = jest.spyOn(Animated, 'timing').mockImplementation((...args: any) => ({ start: () => {} } as any));
    const { getByLabelText } = render(<OrderTrackingScreen />);
    fireEvent(getByLabelText('Help'), 'longPress');
    const { __storeMocks } = require('../../src/state/store');
    expect(__storeMocks.setOrderTracking).toHaveBeenCalledWith('o1', 'transit');
    expect(timingSpy).toHaveBeenCalled();
    timingSpy.mockRestore();
  });

  test('chat and call buttons disabled when rider info unavailable', () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockImplementation(async () => true as any);
    const { getByLabelText } = render(<OrderTrackingScreen />);
    fireEvent(getByLabelText('Help'), 'longPress');
    fireEvent.press(getByLabelText('Chat'));
    fireEvent.press(getByLabelText('Call'));
    expect(openURLSpy).not.toHaveBeenCalled();
    openURLSpy.mockRestore();
  });

  test('polling shows error state on network failure', async () => {
    jest.useFakeTimers();
    // First poll fails
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    const { getByText } = render(<OrderTrackingScreen />);
    await act(async () => {
      jest.advanceTimersByTime(20000);
      await Promise.resolve();
    });
    expect(getByText('Unable to refresh tracking')).toBeTruthy();
    jest.useRealTimers();
  });
});
