import React from 'react';
import { View, useColorScheme } from 'react-native';
import SegmentedControl from '../SegmentedControl';

export default { title: 'SegmentedControl' } as unknown as any;

export const FoodServices = () => (
  <View style={{ padding: 16 }}>
    <SegmentedControl options={[{ key: 'food', label: 'Food' }, { key: 'services', label: 'Services' }]} value={'food'} onChange={() => {}} />
  </View>
);