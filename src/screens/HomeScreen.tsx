import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import SegmentedControl from '../components/SegmentedControl';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';

export default function HomeScreen() {
  const theme = useTheme();
  const [segment, setSegment] = React.useState<'food' | 'services'>('food');
  const orders = useAppStore((s) => s.orders);
  const jobs = useAppStore((s) => s.jobs);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title={segment === 'food' ? 'Food' : 'Services'} />
      <View style={{ padding: 16 }}>
        <SegmentedControl
          options={[{ key: 'food', label: 'Food' }, { key: 'services', label: 'Services' }]}
          value={segment}
          onChange={(k) => setSegment(k as 'food' | 'services')}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {segment === 'food' ? (
          <View>
            <SectionHeader title="Recent Orders" onSeeAll={() => {}} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {orders.filter((o) => o.status === 'ongoing').map((o) => (
                <Card key={o.id} title={o.items[0].name} subtitle={o.items[0].store} price={o.total} />
              ))}
            </ScrollView>
            <SectionHeader title="Nearby spots" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {[1,2,3,4].map((i) => (
                <Card key={`n${i}`} title={`Food Court ${i}`} subtitle="Restaurant" price={`Open`} />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View>
            <SectionHeader title="Recent Jobs" onSeeAll={() => {}} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {jobs.filter((j) => j.status === 'active').map((j) => (
                <Card key={j.id} title={j.title} subtitle={j.category} price={j.professional ?? ''} />
              ))}
            </ScrollView>
            <SectionHeader title="Top Rated Professionals" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {[1,2,3,4].map((i) => (
                <Card key={`p${i}`} title={`Pro ${i}`} subtitle="Plumber" price={"4.9 ⭐"} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});