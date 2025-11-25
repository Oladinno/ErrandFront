import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HeaderProps = {
  title?: string;
  location?: string;
  leftIconType?: 'location' | 'menu';
  onMenuPress?: () => void;
  onCartPress?: () => void;
  onBellPress?: () => void;
};

export default function Header({ title = '', location, leftIconType = 'location', onMenuPress, onCartPress, onBellPress }: HeaderProps) {
  const theme = useTheme();
  const cartCount = useAppStore((s) => s.cart.length);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, paddingTop: Math.max(insets.top, 20) }]} accessibilityRole="header">
      <Pressable onPress={onMenuPress} accessibilityLabel={leftIconType === 'menu' ? 'Open menu' : 'Open location selector'} style={styles.leftIcon}>
        {leftIconType === 'menu' ? (
          <MaterialIcons name="menu" size={22} color={theme.colors.textPrimary} />
        ) : (
          <MaterialIcons name="location-pin" size={22} color={theme.colors.accent} />
        )}
      </Pressable>
      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily }]} numberOfLines={1} ellipsizeMode="tail">
          {location ?? title}
        </Text>
        {!!location && <Feather name="chevron-down" size={18} color={theme.colors.icon} />}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onBellPress} accessibilityLabel="Notifications" style={styles.actionBtn}>
          <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onCartPress} accessibilityLabel={`Cart, ${cartCount} items`} style={styles.actionBtn}>
          <View>
            <MaterialCommunityIcons name="cart-outline" size={22} color={theme.colors.textPrimary} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}
                accessibilityLabel={`Items in cart: ${cartCount}`}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{cartCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
        <Pressable onPress={() => {}} accessibilityLabel="Open chat" style={styles.actionBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftIcon: {
    padding: 8,
    borderRadius: 8,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});