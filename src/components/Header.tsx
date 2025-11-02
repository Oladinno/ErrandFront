import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export type HeaderProps = {
  title?: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onCartPress?: () => void;
  onBellPress?: () => void;
};

export default function Header({ title = '', onMenuPress, onSearchPress, onCartPress, onBellPress }: HeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]} accessibilityRole="header">
      <Pressable onPress={onMenuPress} accessibilityLabel="Open menu" style={styles.leftIcon}>
        <Ionicons name="menu" size={22} color={theme.colors.textPrimary} />
      </Pressable>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onSearchPress} accessibilityLabel="Search" style={styles.actionBtn}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onCartPress} accessibilityLabel="Cart" style={styles.actionBtn}>
          <Ionicons name="cart-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onBellPress} accessibilityLabel="Notifications" style={styles.actionBtn}>
          <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftIcon: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 16,
  },
});