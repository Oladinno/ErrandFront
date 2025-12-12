import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NativeCheckoutMap, getCurrentLocation } from '../../src/screens/CheckoutScreen';

jest.mock('../../src/components/GoogleMapView', () => {
  const React = require('react');
  const { View } = require('react-native');
  const GoogleMapView = ({ children, onRegionChange, onSelect, onLoad, ...props }: any) => (
    <View testID="map" {...props} onRegionChangeComplete={onRegionChange} onPress={(e: any) => onSelect?.(e?.nativeEvent?.coordinate)}>
      {children}
    </View>
  );
  return { __esModule: true, default: GoogleMapView };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 6.83, longitude: 3.646 } })),
  Accuracy: { High: 'high' },
}));

describe('NativeCheckoutMap', () => {
  const region = { latitude: 6.83, longitude: 3.646, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  const markers = [
    { id: 'home', title: 'Home', coordinate: { latitude: 6.83, longitude: 3.646 } },
    { id: 'store', title: 'Food Court', coordinate: { latitude: 6.833, longitude: 3.643 } },
  ];

  test('renders markers and responds to region change', () => {
    const onRegionChange = jest.fn();
    const { getByTestId } = render(
      <NativeCheckoutMap region={region} markers={markers} onRegionChange={onRegionChange} />
    );
    const map = getByTestId('map');
    fireEvent(map, 'onRegionChangeComplete', { latitude: 6.84, longitude: 3.647, latitudeDelta: 0.02, longitudeDelta: 0.02 });
    expect(onRegionChange).toHaveBeenCalled();
  });

  test('selects coordinate on map press', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <NativeCheckoutMap region={region} markers={markers} onSelect={onSelect} />
    );
    const map = getByTestId('map');
    fireEvent(map, 'onPress', { nativeEvent: { coordinate: { latitude: 6.835, longitude: 3.645 } } });
    expect(onSelect).toHaveBeenCalledWith({ latitude: 6.835, longitude: 3.645 });
  });
});

describe('getCurrentLocation', () => {
  test('returns coordinate when permission granted', async () => {
    const coord = await getCurrentLocation();
    expect(coord).toEqual({ latitude: 6.83, longitude: 3.646 });
  });

  test('returns null when permission denied', async () => {
    const Location = require('expo-location');
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const coord = await getCurrentLocation();
    expect(coord).toBeNull();
  });
});
