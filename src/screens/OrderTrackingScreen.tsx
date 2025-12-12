import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import GoogleMapView from '../components/GoogleMapView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../state/store';

type OrderStatus = 'created' | 'preparing' | 'transit' | 'delivered';
type Coordinate = { latitude: number; longitude: number };
type MapRegion = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
type RemoteStatus = 'CREATED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

type ProgressIndicatorProps = {
  current: OrderStatus;
  style?: any;
  onStepPress?: (step: OrderStatus) => void;
};

const ProgressIndicatorRow = React.memo(function ProgressIndicatorRow({ current, style, onStepPress }: ProgressIndicatorProps) {
  const theme = useTheme();
  const idx = current === 'created' ? 0 : current === 'preparing' ? 1 : current === 'transit' ? 2 : 3;
  const steps: Array<{ key: OrderStatus; label: string; icon: string }> = [
    { key: 'created', label: t('order.created'), icon: 'cart-check' },
    { key: 'preparing', label: t('order.preparing'), icon: 'store' },
    { key: 'transit', label: t('order.on_the_way'), icon: 'bike-fast' },
    { key: 'delivered', label: t('order.delivered'), icon: 'check-circle-outline' },
  ];
  return (
    <View style={[styles.progressContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }, style]}> 
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}> 
        {steps.map((s, i) => (
          <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center' }}> 
            <Pressable
              accessibilityLabel={s.label}
              accessibilityRole="image"
              onPress={onStepPress ? () => onStepPress(s.key) : undefined}
              style={[styles.stepIcon, { backgroundColor: theme.colors.background }]}
            > 
              <MaterialCommunityIcons name={s.icon as any} size={18} color={i <= idx ? theme.colors.accent : theme.colors.icon} />
            </Pressable>
            {i < steps.length - 1 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}> 
                {Array.from({ length: 8 }).map((_, j) => (
                  <View key={`${i}-${j}`} style={[styles.dotTiny, { backgroundColor: j < 8 && i < idx ? theme.colors.accent : theme.colors.border }]} />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
});

export default function OrderTrackingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderIdParam: string | undefined = route?.params?.orderId;
  const orders = useAppStore((s) => s.orders);
  const setOrderTracking = useAppStore((s) => s.setOrderTracking);
  const currentOrder = orders.find((o) => o.id === orderIdParam) ?? orders.find((o) => o.status === 'ongoing') ?? orders[0];
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus>((currentOrder?.tracking as OrderStatus) ?? 'created');
  const arrivalTime = formatEta(currentOrder?.eta);
  const riderDetails = { name: 'Micheal John', role: 'Rider', phone: '080...' };
  const [riderName, setRiderName] = React.useState<string>('Micheal John');
  const [riderPhone, setRiderPhone] = React.useState<string>('080...');
  const [riderChatId, setRiderChatId] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const defaultRegion: MapRegion = { latitude: 6.8301, longitude: 3.6460, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  const [region, setRegion] = React.useState<MapRegion>(defaultRegion);
  const vendorCoord: Coordinate = { latitude: region.latitude + 0.003, longitude: region.longitude - 0.003 };
  const destCoord: Coordinate = { latitude: region.latitude, longitude: region.longitude };
  const riderCoord: Coordinate = computeRiderPosition(orderStatus, vendorCoord, destCoord);
  const [mapReady, setMapReady] = React.useState(false);
  const fade = React.useRef(new Animated.Value(1)).current;

  const stages: Array<{ key: OrderStatus; label: string }> = [
    { key: 'created', label: 'Order created' },
    { key: 'preparing', label: 'Your order is being prepared' },
    { key: 'transit', label: 'Your order is on its way' },
    { key: 'delivered', label: 'Delivered' },
  ];
  const idx = orderStatus === 'created' ? 0 : orderStatus === 'preparing' ? 1 : orderStatus === 'transit' ? 2 : 3;

  const next = () => {
    setOrderStatus((s) => {
      const ns = s === 'created' ? 'preparing' : s === 'preparing' ? 'transit' : s === 'transit' ? 'delivered' : 'created';
      if (currentOrder?.id && ns !== 'delivered') setOrderTracking(currentOrder.id, ns as 'created' | 'preparing' | 'transit');
      return ns;
    });
  };

  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);
  }, []);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    fade.setValue(0.3);
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [orderStatus]);

  React.useEffect(() => {
    if (!currentOrder?.id) return;
    let delay = 20000;
    let aborted = false;
    let timeout: any;
    const poll = async () => {
      if (aborted) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/order/track/${currentOrder.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { status: RemoteStatus; rider?: { name?: string; phone?: string; chatId?: string } } = await res.json();
        const mapped = mapRemoteToLocal(data.status);
        setOrderStatus(mapped);
        if (mapped !== 'delivered') setOrderTracking(currentOrder.id, mapped as 'created' | 'preparing' | 'transit');
        if (data.rider) {
          if (typeof data.rider.name === 'string') setRiderName(data.rider.name);
          if (typeof data.rider.phone === 'string') setRiderPhone(data.rider.phone);
          setRiderChatId(data.rider.chatId);
        }
        delay = 20000;
      } catch (e: any) {
        setError('Unable to refresh tracking');
        delay = Math.min(delay * 2, 300000);
      } finally {
        setLoading(false);
        timeout = setTimeout(poll, delay);
      }
    };
    timeout = setTimeout(poll, delay);
    return () => { aborted = true; clearTimeout(timeout); };
  }, [currentOrder?.id]);

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
        <View style={styles.map}>
          <View style={{ flex: 1 }}>
            <GoogleMapView
              region={{ latitude: region.latitude, longitude: region.longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta }}
              markers={[
                { id: 'vendor', title: 'FC', coordinate: vendorCoord, color: '#6C5CE7' },
                { id: 'dest', title: 'ME', coordinate: destCoord, color: theme.colors.accent },
                { id: 'rider', title: 'Rider', coordinate: riderCoord, color: theme.colors.accent },
              ]}
              polyline={[vendorCoord, destCoord]}
              onLoad={() => setMapReady(true)}
              style={{ flex: 1 }}
              testID="map"
            />
            <View testID="polyline" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
          </View>
          {!mapReady && (
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary }}>Loading map...</Text>
            </View>
          )}
        </View>
        <ProgressIndicatorRow current={orderStatus} style={[styles.timelineBar]} />
        <Animated.View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.card, opacity: fade }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}> 
            <View style={[styles.avatarLarge, { backgroundColor: '#6C5CE7' }]}> 
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>FC</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>{stages[idx].label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary }}>{t('eta.prefix')} {arrivalTime}</Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            {orderStatus === 'created' && (
              <Text style={{ color: theme.colors.textSecondary }}>{t('order.sent_to')} '{currentOrder?.items?.[0]?.store ?? 'FoodCourt'}'</Text>
            )}
            {orderStatus === 'preparing' && (
              <View>
                <Text style={{ color: theme.colors.textSecondary }}>{t('order.received_by')} '{currentOrder?.items?.[0]?.store ?? 'FoodCourt'}'.</Text>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 6 }}>{t('order.id_label')} FC- {currentOrder?.id}</Text>
              </View>
            )}
            {orderStatus === 'transit' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.riderBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}> 
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>MJ</Text>
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{riderName}</Text>
                    <Text style={{ color: theme.colors.textSecondary }}>{riderDetails.role}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable accessibilityLabel={t('actions.chat')} disabled={!riderChatId} onPress={() => riderChatId ? navigation.navigate('Messages' as never) : null} style={[styles.iconBtn, { borderColor: theme.colors.border, opacity: riderChatId ? 1 : 0.5 }]}> 
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.textPrimary} />
                  </Pressable>
                  <Pressable accessibilityLabel={t('actions.call')} disabled={!isValidPhone(riderPhone)} onPress={() => Linking.openURL(`tel:${riderPhone}`)} style={[styles.iconBtn, { borderColor: theme.colors.border, opacity: isValidPhone(riderPhone) ? 1 : 0.5 }]}> 
                    <Ionicons name="call-outline" size={18} color={theme.colors.textPrimary} />
                  </Pressable>
                </View>
              </View>
            )}
            {orderStatus === 'delivered' && (
              <Text style={{ color: theme.colors.textSecondary }}>{t('order.delivered_text')}</Text>
            )}
            {loading && (
              <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>{t('updating')}</Text>
            )}
            {!!error && (
              <Text style={{ color: theme.colors.danger, marginTop: 6 }}>{error}</Text>
            )}
          </View>
        </Animated.View>
        <View style={[styles.bottomBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
          <Pressable
            accessibilityLabel={t('see_summary')}
            accessibilityHint={t('see_summary_hint')}
            onPress={() => navigation.getParent()?.navigate('App', { screen: 'RecentOrders' })}
            style={[styles.summaryBtn, { backgroundColor: theme.colors.accent }]}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('see_summary')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function formatEta(eta?: string) {
  if (!eta) return '16:40pm';
  const now = new Date();
  let mins = 20;
  const m = eta.match(/(\d+)-(\d+)\s*mins/i);
  if (m) mins = Math.round((parseInt(m[1], 10) + parseInt(m[2], 10)) / 2);
  const m2 = eta.match(/(\d+)\s*mins/i);
  if (m2) mins = parseInt(m2[1], 10);
  const t = new Date(now.getTime() + mins * 60000);
  const hh = t.getHours();
  const mm = t.getMinutes().toString().padStart(2, '0');
  const suffix = hh >= 12 ? 'pm' : 'am';
  const hr = ((hh + 11) % 12) + 1;
  return `${hr}:${mm}${suffix}`;
}

function computeRiderPosition(status: OrderStatus, start: Coordinate, end: Coordinate): Coordinate {
  const p = status === 'created' ? 0 : status === 'preparing' ? 0 : status === 'transit' ? 0.5 : 1;
  const lat = start.latitude + (end.latitude - start.latitude) * p;
  const lng = start.longitude + (end.longitude - start.longitude) * p;
  return { latitude: lat, longitude: lng };
}

function mapRemoteToLocal(s: RemoteStatus): OrderStatus {
  if (s === 'CREATED') return 'created';
  if (s === 'PREPARING') return 'preparing';
  if (s === 'OUT_FOR_DELIVERY') return 'transit';
  return 'delivered';
}

function isValidPhone(p?: string) {
  if (!p) return false;
  return /^[+]?\d{5,}$/.test(p.replace(/\s|-/g, ''));
}

function t(key: string) {
  const dict: Record<string, string> = {
    'order.created': 'Order created',
    'order.preparing': 'Your order is being prepared',
    'order.on_the_way': 'Your order is on its way',
    'order.delivered': 'Delivered',
    'eta.prefix': 'Estimated arrival time is',
    'order.sent_to': 'Your order has been sent to',
    'order.received_by': 'Your order has been received by',
    'order.id_label': 'Order ID:',
    'actions.chat': 'Chat',
    'actions.call': 'Call',
    'order.delivered_text': 'Your order has been delivered',
    'updating': 'Updating…',
    'see_summary': 'See Order Summary',
    'see_summary_hint': 'Opens order summary screen',
  };
  return dict[key] ?? key;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  map: { width: '100%', height: '60%', position: 'relative' },
  card: { position: 'absolute', left: 16, right: 16, bottom: 96, borderWidth: 1, borderRadius: 16, padding: 12 },
  timelineBar: { position: 'absolute', left: 16, right: 16, bottom: 176, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  stepIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dotTiny: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 2 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { width: 32, height: 2, marginHorizontal: 6, borderRadius: 2 },
  vendorBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avatarLarge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  riderBadge: { width: 40, height: 40, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 36, height: 36, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 },
  summaryBtn: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  mapTag: { position: 'absolute', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12 },
  progressContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: 20, width: '100%', height: 123, alignSelf: 'stretch', flexGrow: 0 },
});
