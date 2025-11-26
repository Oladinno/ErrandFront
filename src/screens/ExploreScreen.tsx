import React from 'react';
import { ScrollView, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useAsync } from '../hooks/useAsync';
import { useTheme } from '../hooks/useTheme';
import SegmentedControl from '../components/SegmentedControl';
import { useAppStore } from '../state/store';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ExploreScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [query, setQuery] = React.useState('');
  const [segment, setSegment] = React.useState<'food' | 'services'>('food');
  const spots = useAppStore((s) => s.spots);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const { loading, error, data, run } = useAsync(async () => {
    // Simulate search API response
    await new Promise((r) => setTimeout(r, 800));
    return [
      { title: 'Food', subtitle: 'Restaurants' },
      { title: 'Groceries', subtitle: 'Stores' },
      { title: 'Convenience', subtitle: 'Shops' },
      { title: 'Pharmacy', subtitle: 'Medicines' },
    ];
  }, [query]);

  React.useEffect(() => {
    if (query.length > 0) run();
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Explore" leftIconType="menu" />
      <View style={{ padding: 16 }}>
        <SearchBar placeholder="Search anything..." value={query} onChangeText={setQuery} onSubmit={run} />
        <View style={{ marginTop: 12 }}>
          <SegmentedControl
            options={[
              { key: 'food', label: 'Food', renderIcon: (active, color) => <Feather name="shopping-bag" size={16} color={color} /> },
              { key: 'services', label: 'Services', renderIcon: (active, color) => <Feather name="tool" size={16} color={color} /> },
            ]}
            value={segment}
            onChange={(k) => setSegment(k as 'food' | 'services')}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionHeader title="🔥 Top spots" onSeeAll={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
          data={spots}
          keyExtractor={(s) => s.id}
          renderItem={({ item: s }) => (
            <Card
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
          )}
        />

        <View style={{ paddingLeft: 16, paddingTop: 12 }}>
          <View style={{ flexDirection: 'row' }}>
            {[{ label: 'All Stores', icon: 'grid' }, { label: 'Restaurants', icon: 'coffee' }, { label: 'Groceries', icon: 'shopping-cart' }, { label: 'Convenience', icon: 'shopping-bag' }].map((c) => (
              <View key={c.label} style={{ alignItems: 'center', marginRight: 16 }}>
                <Pressable accessibilityLabel={c.label} style={[styles.circle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
                  <Feather name={c.icon as any} size={18} color={theme.colors.textSecondary} />
                </Pressable>
                <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingTop: 12, paddingLeft: 16 }}>
          {[
            { label: 'All', icon: 'food' },
            { label: 'Breakfast', icon: 'bread-slice' },
            { label: 'Chicken', icon: 'food-drumstick' },
            { label: 'Burgers', icon: 'hamburger' },
            { label: 'Fish', icon: 'fish' },
            { label: 'Dessert', icon: 'cupcake' },
            { label: 'Grill', icon: 'fire' },
            { label: 'Shawarma', icon: 'wrap' },
          ].map((c, i) => (
            <Pressable key={c.label} accessibilityLabel={`Filter ${c.label}`} style={[styles.pill, { backgroundColor: i === 0 ? theme.colors.accent : theme.colors.card, borderColor: theme.colors.border }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name={c.icon as any} size={14} color={i === 0 ? '#fff' : theme.colors.textSecondary} />
                <Text style={{ color: i === 0 ? '#fff' : theme.colors.textSecondary, fontWeight: '600' }}>{c.label}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <SectionHeader title="😎 Recommended" onSeeAll={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
          data={spots}
          keyExtractor={(s) => s.id + '-rec'}
          renderItem={({ item: s }) => (
            <Card
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
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});