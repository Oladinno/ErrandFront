import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';
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

function Header({ title = '', location, leftIconType = 'menu', onMenuPress, onCartPress, onBellPress }: HeaderProps) {
  const theme = useTheme();
  const cartCount = useAppStore((s) => s.cart.reduce((n, c) => n + (c.qty ?? 1), 0));
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  return (
    <>
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, paddingTop: Math.max(insets.top, 20) }]} accessibilityRole="header">
      <Pressable onPress={() => (leftIconType === 'menu' ? navigation.openDrawer() : onMenuPress?.())} accessibilityLabel={leftIconType === 'menu' ? 'Open menu' : 'Open location selector'} style={styles.leftIcon}>
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
        <Pressable onPress={() => { onCartPress?.(); navigation.navigate('Cart'); }} accessibilityLabel={`Cart, ${cartCount} items`} style={styles.actionBtn}>
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
        <Pressable onPress={() => navigation.navigate('Messages')} accessibilityLabel="Open chat" style={styles.actionBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        {/* hamburger icon is exclusively on the left; removed from actions */}
      </View>
    </View>
    
    </>
  );
}

const areEqual = (prev: HeaderProps, next: HeaderProps) => (
  prev.title === next.title &&
  prev.location === next.location &&
  prev.leftIconType === next.leftIconType &&
  prev.onMenuPress === next.onMenuPress &&
  prev.onCartPress === next.onCartPress &&
  prev.onBellPress === next.onBellPress
);

export default React.memo(Header, areEqual);

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