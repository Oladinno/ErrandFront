import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import Badge from './Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type JobTrackingCardProps = {
  title: string;
  description: string;
  category: string;
  statusText: string;
  offersCount?: number;
  professionalName?: string;
  onPress?: () => void;
};

export default function JobTrackingCard({ title, description, category, statusText, offersCount, professionalName, onPress }: JobTrackingCardProps) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityLabel={title} style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14, fontFamily: theme.typography.fontFamily }} numberOfLines={2}>{title}</Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 4, fontFamily: theme.typography.fontFamily }}>{description}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        <Badge text={category} tone={'accent'} />
        <Badge text={statusText} tone={'warning'} />
        {typeof offersCount === 'number' && (
          <View style={[styles.offerPill, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            accessibilityLabel={`Offers ${offersCount}`}>
            <MaterialCommunityIcons name="account-multiple-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}> {offersCount} new offers</Text>
          </View>
        )}
        {!!professionalName && (
          <View style={[styles.assignee, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]} accessibilityLabel={`Assigned to ${professionalName}`}>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}>{professionalName}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { height: 3, width: 0 },
    elevation: 2,
  },
  offerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  assignee: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});