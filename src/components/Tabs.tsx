import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type TabsProps = {
  tabs: string[];
  value: string;
  onChange: (tab: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tab}
          >
            <Text style={{ color: active ? theme.colors.accent : theme.colors.textSecondary, fontWeight: active ? '700' : '600' }}>{tab}</Text>
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
  tab: {
    marginRight: 16,
    paddingVertical: 12,
  },
});