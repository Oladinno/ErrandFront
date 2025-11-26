import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';
import { useAppStore, Product } from '../state/store';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

export default function CartScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const cart = useAppStore((s) => s.cart);
  const updateQty = useAppStore((s) => s.updateCartQty);
  const remove = useAppStore((s) => s.removeFromCart);
  const hydrate = useAppStore((s) => s.hydrateCart);
  React.useEffect(() => { hydrate(); }, []);

  const stores = useAppStore((s) => s.spots);
  const uniqueStores = Array.from(new Set(cart.map((c) => c.store).filter(Boolean))) as string[];
  const shipping = uniqueStores.reduce((sum, st) => {
    const spot = stores.find((sp) => sp.title === st);
    return sum + (spot?.deliveryFee ?? 0);
  }, 0);
  const subtotal = cart.reduce((sum, p) => sum + p.price * (p.qty ?? 1), 0);
  const taxRate = 0.075;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shipping + tax;

  const renderItem = ({ item }: { item: Product }) => (
    <View style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <Image source={{ uri: item.image ?? `https://picsum.photos/seed/${item.id}/120/120` }} style={styles.thumb} />
      <View style={styles.itemContent}>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{item.name}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{item.store ?? 'Store'}</Text>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>₦ {item.price.toLocaleString()}</Text>
        <View style={styles.qtyRow}>
          <Pressable style={[styles.qtyBtn, { borderColor: theme.colors.border }]} onPress={() => updateQty(item.id, Math.max(0, (item.qty ?? 1) - 1))} accessibilityLabel="Decrease quantity">
            <Text style={{ color: theme.colors.textPrimary }}>-</Text>
          </Pressable>
          <Text style={{ color: theme.colors.textPrimary, minWidth: 24, textAlign: 'center' }}>{item.qty ?? 1}</Text>
          <Pressable style={[styles.qtyBtn, { borderColor: theme.colors.border }]} onPress={() => updateQty(item.id, (item.qty ?? 1) + 1)} accessibilityLabel="Increase quantity">
            <Text style={{ color: theme.colors.textPrimary }}>+</Text>
          </Pressable>
          <Pressable style={[styles.removeBtn, { borderColor: theme.colors.border }]} onPress={() => remove(item.id)} accessibilityLabel="Remove item">
            <Text style={{ color: theme.colors.textSecondary }}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Shopping Carts" onCartPress={() => navigation.navigate('Cart')} />
      {cart.length === 0 ? (
        <View style={[styles.empty, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
          <Text style={{ color: theme.colors.textSecondary }}>Your cart is empty.</Text>
          <Pressable style={[styles.ctaSecondary, { borderColor: theme.colors.border }]} onPress={() => navigation.navigate('App')} accessibilityLabel="Continue shopping">
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Continue Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, gap: 12 }}
          />
          <View style={[styles.summary, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textSecondary }}>Subtotal</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>₦ {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textSecondary }}>Shipping</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>₦ {shipping.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textSecondary }}>Tax</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>₦ {tax.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Total</Text>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>₦ {total.toLocaleString()}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={[styles.ctaSecondary, { borderColor: theme.colors.border }]} onPress={() => navigation.navigate('App')} accessibilityLabel="Continue shopping">
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Continue Shopping</Text>
              </Pressable>
              <Pressable style={[styles.ctaPrimary, { backgroundColor: theme.colors.accent }]} onPress={() => navigation.navigate('Checkout')} accessibilityLabel="Proceed to checkout">
                <Text style={{ color: '#fff', fontWeight: '700' }}>Proceed to Checkout</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 12, gap: 12 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  itemContent: { flex: 1, gap: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  removeBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  summary: { borderTopWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, margin: 16, borderRadius: 12, padding: 16, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  ctaSecondary: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  ctaPrimary: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  empty: { margin: 16, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
});