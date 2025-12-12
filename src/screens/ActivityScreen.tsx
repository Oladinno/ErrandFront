import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SegmentedControl from '../components/SegmentedControl';
import Tabs from '../components/Tabs';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';
import OrderTrackingCard from '../components/OrderTrackingCard';
import JobTrackingCard from '../components/JobTrackingCard';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Badge from '../components/Badge';

export default function ActivityScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [segment, setSegment] = React.useState<'food' | 'services'>('food');
  const [tab, setTab] = React.useState<string>('All Orders');
  const orders = useAppStore((s) => s.orders);
  const jobs = useAppStore((s) => s.jobs);

  React.useEffect(() => {
    setTab(segment === 'food' ? 'All Orders' : 'My Services');
  }, [segment]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Activity" />
      <View style={{ padding: 16 }}>
        <SegmentedControl
          options={[{ key: 'food', label: 'Food' }, { key: 'services', label: 'Services' }]}
          value={segment}
          onChange={(k) => setSegment(k as 'food' | 'services')}
        />
      </View>
      <Tabs
        tabs={
          segment === 'food'
            ? [
                { label: 'All Orders' },
                { label: 'Ongoing Orders', count: orders.filter((o) => o.status === 'ongoing').length },
                { label: 'Past Orders' },
              ]
            : [
                { label: 'My Services' },
                { label: 'Active Jobs', count: jobs.filter((j) => j.status === 'active').length },
                { label: 'Closed Jobs' },
                { label: 'Saved' },
              ]
        }
        value={tab}
        onChange={setTab}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {segment === 'food' ? (
          (tab === 'All Orders' ? orders : tab === 'Ongoing Orders' ? orders.filter((o) => o.status === 'ongoing') : orders.filter((o) => o.status === 'past')).map((o) => (
            <OrderTrackingCard
              key={o.id}
              storeName={o.items[0]?.store ?? 'Food Court'}
              itemsCount={o.items.length}
              total={o.total}
              eta={o.eta}
              statusText={o.status === 'ongoing' ? 'Order is being prepared' : 'Order is on its way'}
              image={o.items[0]?.image ?? 'https://picsum.photos/id/1035/120/120'}
              onPress={() => navigation.getParent()?.navigate('App', { screen: 'OrderTracking', params: { orderId: o.id } })}
            />
          ))
        ) : (
          (tab === 'My Services' ? jobs : tab === 'Active Jobs' ? jobs.filter((j) => j.status === 'active') : tab === 'Closed Jobs' ? jobs.filter((j) => j.status === 'closed') : jobs.filter((j) => j.status === 'saved')).map((j) => (
            <JobTrackingCard
              key={j.id}
              title={j.title}
              description={j.description ?? 'No description'}
              category={j.category}
              statusText={j.status === 'active' ? 'In Progress' : j.status === 'closed' ? 'Completed' : 'Saved'}
              offersCount={j.offersCount}
              professionalName={j.professional}
            />
          ))
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: '#000' }]}
        accessibilityLabel={segment === 'food' ? 'Track orders' : 'Add job'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => {
          if (segment === 'food') {
            const latest = orders.find((o) => o.status === 'ongoing') ?? orders[0];
            navigation.getParent()?.navigate('App', { screen: 'OrderTracking', params: { orderId: latest?.id } });
          }
        }}
      >
        {segment === 'food' ? (
          <>
            <Feather name="link" size={16} color={theme.colors.accent} />
            <Text style={{ color: theme.colors.accent, marginLeft: 8, fontWeight: '600' }}>Track</Text>
          </>
        ) : (
          <>
            <Feather name="plus" size={16} color={'#fff'} />
            <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>Add Job</Text>
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
