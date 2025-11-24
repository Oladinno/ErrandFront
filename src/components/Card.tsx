import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export type CardProps = {
  title: string;
  subtitle?: string;
  price?: string | number;
  image?: string;
  rating?: number;
  reviewsCount?: number;
  deliveryTime?: string;
  isFavorite?: boolean;
  deliveryFee?: number;
  promoBadge?: string | null;
  variant?: 'default' | 'order' | 'spot';
  onPress?: () => void;
  onAdd?: () => void;
  onToggleFavorite?: () => void;
};

export default function Card({ title, subtitle, price, image, rating, reviewsCount, deliveryTime, isFavorite, deliveryFee, promoBadge, variant = 'default', onPress, onAdd, onToggleFavorite }: CardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const spotWidth = Math.min(300, width - 32);
  const orderWidth = Math.min(180, Math.max(160, Math.floor(width * 0.45)));
  return (
    <Pressable
      style={[
        styles.container,
        variant === 'order' && [styles.orderContainer, { width: orderWidth }],
        variant === 'spot' && [styles.spotContainer, { width: spotWidth }],
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
      onPress={onPress}
      accessibilityLabel={title}
    >
      {variant === 'spot' ? (
        <View style={styles.spotImageWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={[styles.spotImage]} />
          ) : (
            <View style={[styles.spotImage, { backgroundColor: theme.colors.surface }]} />
          )}
          {!!promoBadge && (
            <View style={[styles.promoBadge, { backgroundColor: theme.colors.promoGreen }]} accessibilityLabel={promoBadge}>
              <Text style={styles.promoText}>{promoBadge}</Text>
            </View>
          )}
          <Pressable onPress={onToggleFavorite} accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'} style={styles.favoriteBtn}>
            <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? theme.colors.danger : theme.colors.textSecondary} />
          </Pressable>
        </View>
      ) : (
        <>
          {image ? (
            <Image source={{ uri: image }} style={[styles.image, variant === 'order' && styles.orderImage]} />
          ) : (
            <View style={[styles.image, variant === 'order' && styles.orderImage, { backgroundColor: theme.colors.surface }]} />
          )}
          {variant === 'order' && (
            <Pressable onPress={onAdd} accessibilityLabel={`Add ${title}`} style={[styles.addBtn, { backgroundColor: theme.colors.card }]}> 
              <MaterialCommunityIcons name="plus" size={18} color={theme.colors.textPrimary} />
            </Pressable>
          )}
        </>
      )}
      <View style={[styles.info, variant === 'spot' && styles.spotInfo]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
        {variant === 'order' && (
          <View style={styles.metaRow}>
            {!!rating && (
              <View style={styles.metaItem}>
                <FontAwesome name="star" size={12} color="#F59E0B" />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {rating.toFixed(1)}{typeof reviewsCount === 'number' ? ` (${reviewsCount})` : ''}
                </Text>
              </View>
            )}
          </View>
        )}
        {price !== undefined && (
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{typeof price === 'number' ? `₦ ${price.toLocaleString()}` : price}</Text>
        )}
        {variant === 'spot' && (
          <View style={styles.spotMetaRow}>
            <View style={styles.metaItem}>
              <FontAwesome name="star" size={12} color="#F59E0B" />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{rating?.toFixed(1)}</Text>
            </View>
            {!!deliveryTime && (
              <View style={styles.metaItem}>
                <Feather name="clock" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{deliveryTime}</Text>
              </View>
            )}
            <MaterialCommunityIcons name="circle-small" size={16} color={theme.colors.textSecondary} />
            {deliveryFee !== undefined && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="currency-ngn" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{deliveryFee.toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { height: 3, width: 0 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
  },
  orderContainer: {
    width: 180,
  },
  orderImage: {
    aspectRatio: 1,
  },
  spotContainer: {
    width: 300,
  },
  spotImageWrapper: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  spotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  info: {
    padding: 12,
    gap: 4,
  },
  spotInfo: {
    paddingTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
  },
  addBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  promoBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  spotMetaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});