import React from 'react';
import { View, Pressable, Text, StyleSheet, LayoutAnimation, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type SegmentOption = { key: string; label: string; renderIcon?: (active: boolean, color: string) => React.ReactNode };
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
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              onChange(opt.key);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.item,
              active && {
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {opt.renderIcon?.(active, active ? theme.colors.accent : theme.colors.textSecondary)}
              <Text style={{ color: active ? theme.colors.accent : theme.colors.textSecondary, fontWeight: active ? '700' : '500', fontFamily: theme.typography.fontFamily }}>{opt.label}</Text>
            </View>
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
    borderRadius: 4,
    padding: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
  },
});