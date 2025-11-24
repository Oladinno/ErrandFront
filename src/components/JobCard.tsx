import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type JobCardProps = {
  title: string;
  description?: string;
  category: string;
  onPress?: () => void;
};

export default function JobCard({ title, description, category, onPress }: JobCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={title}
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={{ gap: 6 }}>
        <View style={[styles.tag, { backgroundColor: theme.colors.accentMuted }]}
          accessibilityLabel={`Category: ${category}`}>
          <Text style={{ color: theme.colors.accent, fontWeight: '700', fontSize: 12, fontFamily: theme.typography.fontFamily }}>{category}</Text>
        </View>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14, fontFamily: theme.typography.fontFamily }} numberOfLines={2}>{title}</Text>
        {!!description && (
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.typography.fontFamily }} numberOfLines={3}>{description}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { height: 3, width: 0 },
    elevation: 3,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});