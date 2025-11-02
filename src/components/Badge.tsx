import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type BadgeProps = {
  text: string;
  tone?: 'accent' | 'warning' | 'danger' | 'success';
};

export default function Badge({ text, tone = 'accent' }: BadgeProps) {
  const theme = useTheme();
  const bg = tone === 'accent' ? theme.colors.accentMuted : tone === 'warning' ? '#FFF4CC' : tone === 'danger' ? '#FFE4E4' : '#D8F6E7';
  const fg = tone === 'accent' ? theme.colors.accent : tone === 'warning' ? theme.colors.warning : tone === 'danger' ? theme.colors.danger : theme.colors.success;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}
      accessibilityLabel={`Status: ${text}`}> 
      <Text style={{ color: fg, fontWeight: '700', fontSize: 12 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
});