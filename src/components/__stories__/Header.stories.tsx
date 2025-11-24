import React from 'react';
import { View } from 'react-native';
import Header from '../Header';

export default { title: 'Header' } as unknown as any;

export const LocationHeader = () => (
  <View>
    <Header location={'12, North Avenue, CP Street, Sagamu'} />
  </View>
);