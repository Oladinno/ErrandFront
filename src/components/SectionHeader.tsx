import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
};

export default function SectionHeader({ title, subtitle, onSeeAll }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        {!!subtitle && <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {!!onSeeAll && (
        <Pressable onPress={onSeeAll} accessibilityLabel={`See all ${title}`} style={styles.seeAll}>
          <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});