import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList, ScrollView, Alert, TextInput } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, Product } from '../state/store';

type Step = 'details' | 'success';
type ItemRow = { id: string; name: string; price: number; image?: string; quantity: number; options?: string };
type Coordinate = { latitude: number; longitude: number };
type MapRegion = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
type MapMarker = { id: string; title: string; coordinate: Coordinate; color?: string };
type MapProps = { region: MapRegion; markers: MapMarker[]; showsUserLocation?: boolean; onSelect?: (c: Coordinate) => void; onLoad?: () => void; onRegionChange?: (r: MapRegion) => void };

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
  const [navBusy, setNavBusy] = React.useState(false);
  const orders = useAppStore((s) => s.orders);
  const deliveryFee = 1200;
  const serviceFee = 500;
  const walletBalance = 42500;
  const defaultRegion: MapRegion = { latitude: 6.8301, longitude: 3.6460, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  const [region, setRegion] = React.useState<MapRegion>(defaultRegion);
  const [selectedCoord, setSelectedCoord] = React.useState<Coordinate | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [mapError, setMapError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(cart.map((c) => ({ id: c.id, name: c.name, price: c.price, image: c.image, quantity: c.qty ?? 1, options: buildOptions(c) })));
  }, [cart]);

  const subtotal = React.useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const total = subtotal + (isPickup ? 0 : deliveryFee) + serviceFee;

  const format = (n: number) => `₦ ${n.toLocaleString()}`;
  const formatSelected = (c: Coordinate | null) => (c ? `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}` : undefined);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') { setMapError('Location permission denied'); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!active) return;
        const { latitude, longitude } = pos.coords;
        setRegion((r) => ({ ...r, latitude, longitude }));
      } catch {
        setMapError('Unable to fetch current location');
      }
    })();
    return () => { active = false; };
  }, []);


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
              <View style={{ width: '100%', height: 200 }}>
                <NativeCheckoutMap
                  region={region}
                  markers={computePOIs(region)}
                  showsUserLocation
                  onSelect={(c) => setSelectedCoord(c)}
                  onLoad={() => setMapLoaded(true)}
                  onRegionChange={(r) => setRegion(r)}
                />
                {!mapLoaded && (
                  <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary }}>Loading map...</Text>
                  </View>
                )}
              </View>
              <View style={[styles.section, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
                <View style={styles.infoRow}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="home" size={16} color={theme.colors.accent} />
                    <View>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Home</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{formatSelected(selectedCoord) ?? '12, North Avenue, CP Street, Sagamu'}</Text>
                    </View>
                  </View>
                  <Pressable style={{ paddingHorizontal: 8, paddingVertical: 4 }} accessibilityLabel="Reset location" onPress={() => setSelectedCoord(null)}>
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
              {!!mapError && (
                <View style={{ paddingHorizontal: 12 }}>
                  <Text style={{ color: theme.colors.danger }}>{mapError}</Text>
                </View>
              )}

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
                  {!isPickup && (
                    <View style={styles.rowBetween}><Text style={{ color: theme.colors.textSecondary }}>Delivery Fee</Text><Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{format(deliveryFee)}</Text></View>
                  )}
                  <View style={styles.rowBetween}><Text style={{ color: theme.colors.textSecondary }}>Service Fee</Text><Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{format(serviceFee)}</Text></View>
                  <View style={[styles.rowBetween, { marginTop: 4 }]}><Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Total</Text><Text style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>{format(total)}</Text></View>
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
          <Pressable
            onPress={() => {
              try {
                setNavBusy(true);
                const id = createdOrderId ?? orders.find((o) => o.status === 'ongoing')?.id ?? undefined;
                navigation.navigate('App' as never, { screen: 'OrderTracking', params: { orderId: id } } as never);
              } catch {
                Alert.alert('Unable to open tracking');
              } finally {
                setTimeout(() => setNavBusy(false), 300);
              }
            }}
            style={[styles.successBtn, { backgroundColor: theme.colors.accent, opacity: navBusy ? 0.8 : 1 }]} accessibilityLabel="Track Order"
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{navBusy ? 'Opening…' : 'Track Order'}</Text>
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

export function xyToCoordinate(x: number, y: number, layout: { width: number; height: number }, region: MapRegion): Coordinate {
  const lon = region.longitude - region.longitudeDelta / 2 + (x / layout.width) * region.longitudeDelta;
  const lat = region.latitude + region.latitudeDelta / 2 - (y / layout.height) * region.latitudeDelta;
  return { latitude: lat, longitude: lon };
}

export function coordinateToXY(coord: Coordinate, layout: { width: number; height: number }, region: MapRegion): { x: number; y: number } {
  const x = ((coord.longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) * layout.width;
  const y = ((region.latitude + region.latitudeDelta / 2 - coord.latitude) / region.latitudeDelta) * layout.height;
  return { x, y };
}

export function computePOIs(region: MapRegion): MapMarker[] {
  const home: MapMarker = { id: 'home', title: 'Home', coordinate: { latitude: region.latitude, longitude: region.longitude }, color: '#2ECC71' };
  const store: MapMarker = { id: 'store', title: 'Food Court', coordinate: { latitude: region.latitude + 0.003, longitude: region.longitude - 0.003 }, color: '#6C5CE7' };
  return [home, store];
}

export async function getCurrentLocation(): Promise<Coordinate | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

export function NativeCheckoutMap({ region, markers, showsUserLocation, onSelect, onLoad, onRegionChange }: MapProps) {
  const theme = useTheme();
  const initialRegion: Region = { latitude: region.latitude, longitude: region.longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta };
  return (
    <MapView
      style={{ width: '100%', height: '100%', borderRadius: 12 }}
      initialRegion={initialRegion}
      onRegionChangeComplete={(r) => onRegionChange?.({ latitude: r.latitude, longitude: r.longitude, latitudeDelta: r.latitudeDelta, longitudeDelta: r.longitudeDelta })}
      showsUserLocation={!!showsUserLocation}
      onMapReady={() => onLoad?.()}
      onPress={(e) => onSelect?.({ latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude })}
    >
      {markers.map((m) => (
        <Marker key={m.id} coordinate={{ latitude: m.coordinate.latitude, longitude: m.coordinate.longitude }} tracksViewChanges={false}>
          <View style={{ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12, backgroundColor: m.color ?? theme.colors.accent }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>{m.title}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
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
