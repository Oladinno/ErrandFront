import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type SegmentOption = { key: string; label: string };
export type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
};

export default function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: theme.colors.card, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }]}
          >
            <Text style={{ color: active ? theme.colors.accent : theme.colors.textSecondary, fontWeight: active ? '700' : '500' }}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 24,
    padding: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
});