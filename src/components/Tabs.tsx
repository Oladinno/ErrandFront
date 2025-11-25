import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type TabItem = string | { label: string; count?: number };
export type TabsProps = {
  tabs: TabItem[];
  value: string;
  onChange: (tab: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      {tabs.map((tab) => {
        const label = typeof tab === 'string' ? tab : tab.label;
        const count = typeof tab === 'string' ? undefined : tab.count;
        const active = label === value;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(label)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tab}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: active ? theme.colors.accent : theme.colors.textSecondary, fontWeight: active ? '700' : '600' }}>{label}</Text>
              {typeof count === 'number' && (
                <View style={[styles.badge, { backgroundColor: theme.mode === 'dark' ? '#FFFFFF' : '#000000' }]}
                  accessibilityLabel={`Count ${count}`}>
                  <Text style={{ color: theme.mode === 'dark' ? theme.colors.textPrimary : '#FFFFFF', fontWeight: '700', fontSize: 11 }}>{count}</Text>
                </View>
              )}
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
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  tab: {
    marginRight: 16,
    paddingVertical: 12,
  },
  badge: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
});