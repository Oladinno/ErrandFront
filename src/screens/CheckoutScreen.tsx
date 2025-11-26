import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';

export default function CheckoutScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Checkout" />
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.textSecondary }}>Checkout flow coming soon.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});