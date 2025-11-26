import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../state/store';

type OrderStatus = 'created' | 'preparing' | 'transit';

export default function OrderTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderIdParam: string | undefined = route?.params?.orderId;
  const orders = useAppStore((s) => s.orders);
  const setOrderTracking = useAppStore((s) => s.setOrderTracking);
  const currentOrder = orders.find((o) => o.id === orderIdParam) ?? orders.find((o) => o.status === 'ongoing') ?? orders[0];
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus>((currentOrder?.tracking as OrderStatus) ?? 'created');
  const arrivalTime = currentOrder?.eta ?? '16:40pm';
  const riderDetails = { name: 'Micheal John', role: 'Rider', phone: '080...' };

  const stages: Array<{ key: OrderStatus | 'done'; icon: React.ReactNode }> = [
    { key: 'created', icon: <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={theme.colors.textPrimary} /> },
    { key: 'preparing', icon: <MaterialCommunityIcons name="bike-fast" size={16} color={theme.colors.textPrimary} /> },
    { key: 'transit', icon: <MaterialCommunityIcons name="check-circle-outline" size={16} color={theme.colors.textPrimary} /> },
  ];
  const idx = orderStatus === 'created' ? 0 : orderStatus === 'preparing' ? 1 : 2;

  const next = () => {
    setOrderStatus((s) => {
      const ns = s === 'created' ? 'preparing' : s === 'preparing' ? 'transit' : 'created';
      if (currentOrder?.id) setOrderTracking(currentOrder.id, ns);
      return ns;
    });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.topBar, { paddingHorizontal: 16, paddingVertical: 12 }]}> 
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back" style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => {}} onLongPress={next} accessibilityLabel="Help" style={{ marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16 }}>
          <Text style={{ color: theme.colors.textSecondary }}>Help ?</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        <Image source={{ uri: 'https://placehold.co/800x1200/FAFAFA/CCCCCC?text=Map' }} style={styles.map} />
        <View style={[styles.mapTag, { top: 110, left: 24, backgroundColor: '#FFE8F4' }]}> 
          <Text style={{ color: '#C2185B', fontSize: 11 }}>Recently viewed</Text>
        </View>
        <View style={[styles.mapTag, { top: 180, right: 32, backgroundColor: '#E9F6FF' }]}> 
          <Text style={{ color: '#1E88E5', fontSize: 11 }}>Top rated</Text>
        </View>
        <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
          <View style={styles.timeline}> 
            {stages.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.timelineIcon, { backgroundColor: i <= idx ? theme.colors.background : theme.colors.background }]}> 
                  {React.cloneElement(s.icon as any, { color: i < idx ? theme.colors.accent : i === idx ? theme.colors.textPrimary : theme.colors.icon })}
                </View>
                {i < stages.length - 1 && (
                  <View style={styles.dotsRow}>
                    {Array.from({ length: 12 }).map((_, j) => (
                      <View key={j} style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                    ))}
                  </View>
                )}
              </View>
            ))}
            <Pressable accessibilityLabel="More" style={{ marginLeft: 'auto', padding: 6 }}>
              <Feather name="more-horizontal" size={18} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}> 
            <View style={[styles.vendorBadge, { backgroundColor: '#6C5CE7' }]}> 
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>FC</Text>
            </View>
            <View style={{ marginLeft: 8, flex: 1 }}>
              {orderStatus === 'created' && (
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>Order created</Text>
              )}
              {orderStatus === 'preparing' && (
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>Your order is being prepared</Text>
              )}
              {orderStatus === 'transit' && (
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>Your order is on its way</Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary }}>Estimated arrival time is {arrivalTime}</Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            {orderStatus === 'created' && (
              <Text style={{ color: theme.colors.textSecondary }}>Your order has been sent to '{currentOrder?.items?.[0]?.store ?? 'FoodCourt'}'</Text>
            )}
            {orderStatus === 'preparing' && (
              <Text style={{ color: theme.colors.textSecondary }}>Your order has been received by '{currentOrder?.items?.[0]?.store ?? 'FoodCourt'}'. OrderID: FC-18sj17</Text>
            )}
            {orderStatus === 'transit' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.riderBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}> 
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>MJ</Text>
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{riderDetails.name}</Text>
                    <Text style={{ color: theme.colors.textSecondary }}>{riderDetails.role}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable accessibilityLabel="Chat" onPress={() => console.log('Initiating chat with Micheal John')} style={[styles.iconBtn, { borderColor: theme.colors.border }]}> 
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.textPrimary} />
                  </Pressable>
                  <Pressable accessibilityLabel="Call" onPress={() => console.log('Calling Micheal John')} style={[styles.iconBtn, { borderColor: theme.colors.border }]}> 
                    <Ionicons name="call-outline" size={18} color={theme.colors.textPrimary} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={[styles.placeholderBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
            <View style={[styles.placeholderBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
          </View>
        </View>
        <View style={[styles.bottomBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
          <Pressable accessibilityLabel="See Order Summary" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 }}> 
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>See Order Summary</Text>
            <Feather name="chevron-down" size={18} color={theme.colors.textPrimary} style={{ marginLeft: 8 }} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  map: { width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 },
  card: { position: 'absolute', left: 16, right: 16, bottom: 72, borderWidth: 1, borderRadius: 16, padding: 12 },
  timeline: { flexDirection: 'row', alignItems: 'center' },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  dot: { width: 3, height: 3, borderRadius: 2, marginHorizontal: 2 },
  vendorBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  riderBadge: { width: 28, height: 28, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 36, height: 36, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  placeholderBox: { flex: 1, height: 64, borderWidth: 1, borderRadius: 12 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 },
  mapTag: { position: 'absolute', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12 },
});