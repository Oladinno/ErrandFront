import React from 'react';
import { ScrollView, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SegmentedControl from '../components/SegmentedControl';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import JobCard from '../components/JobCard';
import ProCard from '../components/ProCard';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';
import { useMessagesStore } from '../state/messagesStore';
import SearchBar from '../components/SearchBar';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const [segment, setSegment] = React.useState<'food' | 'services'>('food');
  const orders = useAppStore((s) => s.orders);
  const jobs = useAppStore((s) => s.jobs);
  const spots = useAppStore((s) => s.spots);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const professionals = useAppStore((s) => s.professionals);
  const savedProIds = useAppStore((s) => s.savedProfessionalIds);
  const toggleSavePro = useAppStore((s) => s.toggleSaveProfessional);
  const addToCart = useAppStore((s) => s.addToCart);
  const [serviceCategory, setServiceCategory] = React.useState<'All' | 'Plumber' | 'Electrician' | 'Carpenter' | 'Painter'>('All');
  const filteredJobs = React.useMemo(() => jobs.filter((j) => j.status === 'active' && (serviceCategory === 'All' || j.category === serviceCategory)), [jobs, serviceCategory]);
  const filteredPros = React.useMemo(() => professionals.filter((p) => serviceCategory === 'All' || p.category === serviceCategory), [professionals, serviceCategory]);
  const setSelectedThread = useMessagesStore((s) => s.setSelectedThreadId);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header location={"12, North Avenue, CP Street, Sagamu"} />
      <View style={{ padding: 16 }}>
        <SegmentedControl
          options={[
            { key: 'food', label: 'Food', renderIcon: (active, color) => <Feather name="shopping-bag" size={16} color={color} /> },
            { key: 'services', label: 'Services', renderIcon: (active, color) => <Feather name="tool" size={16} color={color} /> },
          ]}
          value={segment}
          onChange={(k) => setSegment(k as 'food' | 'services')}
        />
      </View>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1, height: 90, backgroundColor: theme.colors.surface, borderRadius: 12 }} />
        <View style={{ flex: 1, height: 90, backgroundColor: theme.colors.surface, borderRadius: 12 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {segment === 'food' ? (
          <View>
            <SectionHeader title="Recent Orders" onSeeAll={() => navigation.getParent()?.navigate('App', { screen: 'RecentOrders' })} />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
              data={orders.filter((o) => o.status === 'ongoing')}
              keyExtractor={(o) => o.id}
              renderItem={({ item: o }) => (
                <Card
                  variant="order"
                  title={o.items[0]?.name ?? 'Order'}
                  subtitle={o.items[0]?.store ?? 'FoodCourt'}
                  price={o.total}
                  image={o.items[0]?.image ?? 'https://picsum.photos/id/1035/400/400'}
                  rating={o.items[0]?.rating ?? 4.2}
                  reviewsCount={o.items[0]?.reviews ?? 13}
                  onAdd={() => {
                    o.items.forEach((it) => {
                      addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, store: it.store, rating: it.rating, reviews: it.reviews });
                    });
                  }}
                />
              )}
            />
            <SectionHeader title="Nearby spots" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {spots.map((s) => (
                <Card
                  key={s.id}
                  variant="spot"
                  title={s.title}
                  subtitle={s.category}
                  image={s.image}
                  rating={s.rating}
                  deliveryTime={s.deliveryTime}
                  deliveryFee={s.deliveryFee}
                  promoBadge={s.promoBadge}
                  isFavorite={s.isFavorite}
                  onToggleFavorite={() => toggleSpotFavorite(s.id)}
                  onPress={() => navigation.getParent()?.navigate('App', { screen: 'Store', params: { storeId: s.id } })}
                />
              ))}
            </ScrollView>
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <SearchBar placeholder="Search here..." />
            </View>
          </View>
        ) : (
          <View>
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Pressable accessibilityLabel="Post a Job" style={[styles.qaBtn, { backgroundColor: theme.colors.card }]} onPress={() => navigation.getParent()?.navigate('App', { screen: 'PostJob' })}> 
                    <Feather name="plus" size={22} color={theme.colors.accent} />
                  </Pressable>
                  <Text style={{ color: theme.colors.accent, fontWeight: '600', marginTop: 8 }}>Post a Job</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Pressable accessibilityLabel="My Jobs" style={[styles.qaBtn, { backgroundColor: theme.colors.card }]} onPress={() => navigation.getParent()?.navigate('My Jobs')}> 
                    <Feather name="grid" size={22} color={theme.colors.accent} />
                  </Pressable>
                  <Text style={{ color: theme.colors.accent, fontWeight: '600', marginTop: 8 }}>My Jobs</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Pressable accessibilityLabel="Send a Package" style={[styles.qaBtn, { backgroundColor: theme.colors.card }]} onPress={() => navigation.getParent()?.navigate('Send a Package')}> 
                    <Feather name="send" size={22} color={theme.colors.accent} />
                  </Pressable>
                  <Text style={{ color: theme.colors.accent, fontWeight: '600', marginTop: 8 }}>Send a Package</Text>
                </View>
              </View>
            </View>

            <SectionHeader title="Recent Jobs" onSeeAll={() => navigation.getParent()?.navigate('App', { screen: 'RecentJobs' })} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {filteredJobs.map((j) => (
                <JobCard key={j.id} title={j.title} description={'Please help fix leaking kitchen sink and replace tap. Bring your tools.'} category={j.category} />
              ))}
            </ScrollView>

            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <SearchBar placeholder="Search here..." />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingTop: 12, paddingLeft: 16 }}>
              {[
                { label: 'All', icon: 'grid' as const },
                { label: 'Plumber', icon: 'tool' as const },
                { label: 'Electrician', icon: 'zap' as const },
                { label: 'Carpenter', icon: 'tool' as const },
                { label: 'Painter', icon: 'edit-3' as const },
              ].map((c, i) => (
                <Pressable
                  key={c.label}
                  accessibilityLabel={`Filter ${c.label}`}
                  onPress={() => setServiceCategory(c.label as any)}
                  style={[
                    styles.filter,
                    { backgroundColor: serviceCategory === c.label ? theme.colors.accent : theme.colors.card, borderColor: theme.colors.border },
                  ]}
                > 
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name={c.icon} size={14} color={serviceCategory === c.label ? '#fff' : theme.colors.textSecondary} />
                    <Text style={{ color: serviceCategory === c.label ? '#fff' : theme.colors.textSecondary, fontWeight: '600' }}>{c.label}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            <SectionHeader title="Top Rated Professionals" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {filteredPros.map((p) => (
                <ProCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category}
                  location={p.location}
                  distanceText={`${p.distanceKm}km away`}
                  isSaved={savedProIds.includes(p.id)}
                  onToggleSave={toggleSavePro}
                  onPress={() => navigation.getParent()?.navigate('App', { screen: 'ProviderProfile', params: { providerId: p.id } })}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
      <Pressable
        style={[styles.fab, { backgroundColor: '#000' }]}
        accessibilityLabel="Open Padi chat"
        onPress={() => {
          setSelectedThread('t1');
          navigation.getParent()?.navigate('Messages', { screen: 'Chat Detail' });
        }}
      >
        <Feather name="message-circle" size={16} color={theme.colors.accent} />
        <Text style={{ color: theme.colors.accent, marginLeft: 8, fontWeight: '600' }}>Padi</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  qaBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
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
