import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type CardProps = {
  title: string;
  subtitle?: string;
  price?: string | number;
  image?: string;
  onPress?: () => void;
};

export default function Card({ title, subtitle, price, image, onPress }: CardProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={onPress}
      accessibilityLabel={title}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: theme.colors.surface }]} />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
        {price !== undefined && (
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{typeof price === 'number' ? `₦ ${price.toLocaleString()}` : price}</Text>
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
  },
  image: {
    width: '100%',
    height: 120,
  },
  info: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});