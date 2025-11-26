import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, Product } from '../state/store';

type Step = 'details' | 'success';
type ItemRow = { id: string; name: string; price: number; image?: string; quantity: number; options?: string };

export default function CheckoutScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const cart = useAppStore((s) => s.cart);
  const placeOrderFromCart = useAppStore((s) => s.placeOrderFromCart);
  const [currentStep, setCurrentStep] = React.useState<Step>('details');
  const [createdOrderId, setCreatedOrderId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<ItemRow[]>(() => cart.map((c) => ({ id: c.id, name: c.name, price: c.price, image: c.image, quantity: c.qty ?? 1, options: buildOptions(c) })));
  const [isPickup, setIsPickup] = React.useState(false);
  const [riderNotes, setRiderNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'bank' | 'card'>('bank');
  const deliveryFee = 1200;
  const serviceFee = 500;
  const walletBalance = 42500;

  React.useEffect(() => {
    setItems(cart.map((c) => ({ id: c.id, name: c.name, price: c.price, image: c.image, quantity: c.qty ?? 1, options: buildOptions(c) })));
  }, [cart]);

  const subtotal = React.useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const total = subtotal + (isPickup ? 0 : deliveryFee) + serviceFee;

  const format = (n: number) => `₦ ${n.toLocaleString()}`;


  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {currentStep === 'details' && (
        <View style={{ flex: 1 }}>
          <View style={[styles.topBar, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
            <Pressable onPress={() => navigation.goBack()} style={styles.topBtn} accessibilityLabel="Back">
              <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={[styles.topTitle, { color: theme.colors.textPrimary }]}>Order Checkout</Text>
            <Pressable onPress={() => setIsPickup((v) => !v)} style={[styles.pickupToggle, { borderColor: theme.colors.border, backgroundColor: isPickup ? theme.colors.card : theme.colors.background }]} accessibilityLabel="Pickup?"> 
              <Feather name="user" size={14} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, marginLeft: 6 }}>Pickup?</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={{ padding: 16, gap: 16 }}>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Delivery</Text>
              <Image source={{ uri: 'https://placehold.co/600x200/2E2E2E/FFFFFF?text=Map+Placeholder' }} style={{ width: '100%', height: 120, borderRadius: 12 }} />
              <View style={[styles.section, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
                <View style={styles.infoRow}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="home" size={16} color={theme.colors.accent} />
                    <View>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Home</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>12, North Avenue, CP Street, Sagamu</Text>
                    </View>
                  </View>
                  <Pressable style={{ paddingHorizontal: 8, paddingVertical: 4 }} accessibilityLabel="Change">
                    <Feather name="chevron-right" size={18} color={theme.colors.textSecondary} />
                  </Pressable>
                </View>
                <View style={styles.infoRow}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textPrimary }}>Estimated Delivery Time</Text>
                  </View>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>12-25 mins</Text>
                </View>
                {!isPickup && (
                  <View style={styles.infoRow}> 
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="bike-fast" size={16} color={theme.colors.textSecondary} />
                      <Text style={{ color: theme.colors.textPrimary }}>Delivery Fee</Text>
                    </View>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{format(deliveryFee)}</Text>
                  </View>
                )}
                <TextInput
                  placeholder="Add notes for the rider (Optional)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={riderNotes}
                  onChangeText={setRiderNotes}
                  style={[styles.notesInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Pressable onPress={() => setIsPickup(false)} style={[styles.pill, { borderColor: theme.colors.border, backgroundColor: !isPickup ? theme.colors.card : theme.colors.background }]} accessibilityLabel="Delivery">
                    <Text style={{ color: !isPickup ? theme.colors.textPrimary : theme.colors.textSecondary }}>Delivery</Text>
                  </Pressable>
                  <Pressable onPress={() => setIsPickup(true)} style={[styles.pill, { borderColor: theme.colors.border, backgroundColor: isPickup ? theme.colors.card : theme.colors.background }]} accessibilityLabel="Pickup">
                    <Text style={{ color: isPickup ? theme.colors.textPrimary : theme.colors.textSecondary }}>Pickup</Text>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.section, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Order Summary</Text>
                <View style={styles.vendorHeader}> 
                  <View style={[styles.vendorBadge, { backgroundColor: '#6C5CE7' }]}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>EC</Text>
                  </View>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Food Court</Text>
                  <Text style={{ color: theme.colors.textSecondary, marginLeft: 'auto' }}>{items.length} items totaling {format(subtotal)}</Text>
                </View>
                <View style={{ marginTop: 12, gap: 8 }}>
                  {items.map((i) => (
                    <View key={i.id} style={styles.itemRow}> 
                      <View style={[styles.qtyPill, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{i.quantity}</Text>
                      </View>
                      <Text style={{ flex: 1, color: theme.colors.textPrimary }}>{i.name}</Text>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{format(i.price * i.quantity)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.section, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Payment Method</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable onPress={() => setPaymentMethod('bank')} style={[styles.paymentCard, { borderColor: paymentMethod === 'bank' ? theme.colors.accent : theme.colors.border, backgroundColor: theme.colors.background }]}> 
                    <View style={[styles.paymentIcon, { backgroundColor: theme.colors.card }]}>
                      <MaterialCommunityIcons name="cash-multiple" size={18} color={theme.colors.textPrimary} />
                    </View>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Bank Transfer</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Transfer from your bank</Text>
                  </Pressable>
                  <Pressable onPress={() => setPaymentMethod('card')} style={[styles.paymentCard, { borderColor: paymentMethod === 'card' ? theme.colors.accent : theme.colors.border, backgroundColor: theme.colors.background }]}> 
                    <View style={[styles.paymentIcon, { backgroundColor: theme.colors.card }]}>
                      <Ionicons name="card-outline" size={18} color={theme.colors.textPrimary} />
                    </View>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Pay with Card</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Use your card ending with '0943'</Text>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.section, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Payment Summary</Text>
                <View style={{ marginTop: 12, gap: 8 }}>
                  <View style={styles.rowBetween}><Text style={{ color: theme.colors.textSecondary }}>Subtotal</Text><Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{format(subtotal)}</Text></View>
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={[styles.footerBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
            <Pressable onPress={() => { if (walletBalance > total) { const id = placeOrderFromCart('12-25 mins'); setCreatedOrderId(id); setCurrentStep('success'); } else Alert.alert('Insufficient balance'); }} style={[styles.footerBtn, { backgroundColor: theme.colors.accent }]} accessibilityLabel="Pay">
              <Text style={{ color: '#fff', fontWeight: '700' }}>Pay {format(total)}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {currentStep === 'success' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <MaterialCommunityIcons name="check-circle" size={96} color={theme.colors.accent} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '800', fontSize: 20, textAlign: 'center', marginTop: 12 }}>Order Placed Successfully</Text>
          <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6 }}>Sit back and relax, your order is being processed.</Text>
          <Pressable onPress={() => navigation.getParent()?.navigate('App', { screen: 'OrderTracking', params: { orderId: createdOrderId } })} style={[styles.successBtn, { backgroundColor: theme.colors.accent }]} accessibilityLabel="Track Order">
            <Text style={{ color: '#fff', fontWeight: '700' }}>Track Order</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function buildOptions(p: Product) {
  const sides = p.customizations?.sides?.join(' + ');
  const cs = p.customizations?.chickenStyle ? `Chicken: ${p.customizations?.chickenStyle}` : undefined;
  const parts = [sides, cs].filter(Boolean);
  return parts.length ? parts.join(' | ') : undefined;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  topBtn: { padding: 8 },
  topTitle: { fontSize: 16, fontWeight: '700' },
  footerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, padding: 16 },
  footerBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  section: { borderWidth: 1, borderRadius: 12, padding: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  successBtn: { marginTop: 16, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignSelf: 'stretch' },
  pickupToggle: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  notesInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginTop: 8 },
  vendorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vendorBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyPill: { width: 28, height: 28, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  paymentCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  paymentIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }
});