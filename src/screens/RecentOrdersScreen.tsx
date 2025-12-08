import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../state/store';
import OrderTrackingCard from '../components/OrderTrackingCard';

export default function RecentOrdersScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const orders = useAppStore((s) => s.orders);
  const past = orders.filter((o) => o.status === 'past');

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back" style={styles.backBtn}> 
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Past Orders</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={past}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item: o }) => (
          <OrderTrackingCard
            storeName={o.items[0].store ?? 'Food Court'}
            itemsCount={o.items.length}
            total={o.total}
            eta={o.eta}
            statusText={'Order fulfilled'}
            image={o.items[0].image ?? 'https://picsum.photos/id/1035/120/120'}
            onPress={() => navigation.getParent()?.navigate('App', { screen: 'OrderTracking', params: { orderId: o.id } })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
});