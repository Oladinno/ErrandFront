import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';

export type ProCardProps = {
  name: string;
  category: string;
  location: string;
  distanceText: string;
  onSave?: () => void;
};

export default function ProCard({ name, category, location, distanceText, onSave }: ProCardProps) {
  const theme = useTheme();
  return (
    <Pressable accessibilityLabel={name} style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => {}}>
      <View style={styles.row}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14, fontFamily: theme.typography.fontFamily }}>{name}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.typography.fontFamily }}>{category} • {location}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.typography.fontFamily }}>{distanceText}</Text>
        </View>
        <Pressable accessibilityLabel="Save professional" onPress={onSave} style={styles.saveBtn}>
          <Feather name="flag" size={16} color={theme.colors.textSecondary} />
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
  },
});