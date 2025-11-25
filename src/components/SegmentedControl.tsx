import React from 'react';
import { View, Pressable, Text, StyleSheet, LayoutAnimation } from 'react-native';
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
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}> 
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
            style={styles.item}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {opt.renderIcon?.(active, active ? theme.colors.accent : theme.colors.textSecondary)}
              <Text style={{ color: active ? theme.colors.accent : theme.colors.textSecondary, fontWeight: active ? '700' : '500', fontFamily: theme.typography.fontFamily }}>{opt.label}</Text>
            </View>
            <View style={[styles.indicator, { backgroundColor: active ? theme.colors.accent : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
  },
});