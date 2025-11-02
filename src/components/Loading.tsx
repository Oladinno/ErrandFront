import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function Loading() {
  const theme = useTheme();
  return (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <ActivityIndicator color={theme.colors.accent} />
    </View>
  );
}