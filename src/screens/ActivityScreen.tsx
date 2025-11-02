import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import SegmentedControl from '../components/SegmentedControl';
import Tabs from '../components/Tabs';
import Badge from '../components/Badge';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';

export default function ActivityScreen() {
  const theme = useTheme();
  const [segment, setSegment] = React.useState<'food' | 'services'>('food');
  const [tab, setTab] = React.useState<string>('Ongoing Orders');
  const orders = useAppStore((s) => s.orders);
  const jobs = useAppStore((s) => s.jobs);

  React.useEffect(() => {
    setTab(segment === 'food' ? 'Ongoing Orders' : 'Active Jobs');
  }, [segment]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Activity" />
      <View style={{ padding: 16 }}>
        <SegmentedControl
          options={[{ key: 'food', label: 'Food' }, { key: 'services', label: 'Services' }]}
          value={segment}
          onChange={(k) => setSegment(k as 'food' | 'services')}
        />
      </View>
      <Tabs
        tabs={segment === 'food' ? ['Ongoing Orders', 'Past Orders'] : ['Active Jobs', 'Closed Jobs', 'Saved']}
        value={tab}
        onChange={setTab}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {segment === 'food' ? (
          (tab === 'Ongoing Orders' ? orders.filter((o) => o.status === 'ongoing') : orders.filter((o) => o.status === 'past')).map((o) => (
            <View key={o.id} style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{o.items[0].store}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{o.items[0].name} • ₦ {o.total.toLocaleString()}</Text>
              <Badge text={o.status === 'ongoing' ? 'Order is being prepared' : 'Delivered'} tone={o.status === 'ongoing' ? 'accent' : 'success'} />
            </View>
          ))
        ) : (
          jobs
            .filter((j) => (tab === 'Active Jobs' ? j.status === 'active' : tab === 'Closed Jobs' ? j.status === 'closed' : j.status === 'saved'))
            .map((j) => (
              <View key={j.id} style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{j.title}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>{j.category}</Text>
                <Badge text={j.status === 'active' ? 'Pending' : j.status === 'closed' ? 'Completed' : 'Saved'} tone={j.status === 'active' ? 'warning' : j.status === 'closed' ? 'success' : 'accent'} />
              </View>
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});