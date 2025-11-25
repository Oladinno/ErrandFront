import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Badge from './Badge';

export type OrderTrackingCardProps = {
  storeName: string;
  itemsCount: number;
  total: number;
  eta?: string;
  statusText: string;
  image?: string;
  onPress?: () => void;
};

export default function OrderTrackingCard({ storeName, itemsCount, total, eta, statusText, image, onPress }: OrderTrackingCardProps) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityLabel={storeName} style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <View style={styles.row}>
        {image ? (
          <Image source={{ uri: image }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: theme.colors.surface }]} />
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14, fontFamily: theme.typography.fontFamily }}>{storeName}</Text>
            <Feather name="chevron-right" size={18} color={theme.colors.icon} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <MaterialCommunityIcons name="currency-ngn" size={14} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}>₦ {total.toLocaleString()}</Text>
            {!!eta && (
              <>
                <Feather name="clock" size={12} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily }}>{eta}</Text>
              </>
            )}
          </View>
          <Text style={{ color: theme.colors.textSecondary, marginTop: 4, fontFamily: theme.typography.fontFamily }}>{itemsCount} items totaling ₦ {total.toLocaleString()}</Text>
          <View style={{ marginTop: 8 }}>
            <Badge text={statusText} tone={'success'} />
          </View>
        </View>
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
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
});