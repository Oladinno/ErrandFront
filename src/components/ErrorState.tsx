import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function ErrorState({ message = 'Something went wrong' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={{ padding: 24 }}>
      <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>{message}</Text>
    </View>
  );
}