import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export type ProCardProps = {
  id: string;
  name: string;
  category: string;
  location: string;
  distanceText: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onPress?: () => void;
};

export default function ProCard({ id, name, category, location, distanceText, isSaved, onToggleSave, onPress }: ProCardProps) {
  const theme = useTheme();
  return (
    <Pressable accessibilityLabel={name} style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14, fontFamily: theme.typography.fontFamily }}>{name}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.typography.fontFamily }}>{category} • {location}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.typography.fontFamily }}>{distanceText}</Text>
        </View>
        <Pressable accessibilityLabel={isSaved ? 'Unsave professional' : 'Save professional'} onPress={() => onToggleSave?.(id)} style={styles.saveBtn}>
          <MaterialCommunityIcons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={isSaved ? theme.colors.accent : theme.colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { height: 3, width: 0 },
    elevation: 3,
    width: 260,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  saveBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
