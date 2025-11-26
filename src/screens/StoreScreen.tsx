import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, FlatList } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../state/store';

type MenuItem = { id: string; name: string; description: string; price: number; rating: number; reviews: number; category: 'Main' | 'Drinks' | 'Side' | 'Snacks'; image?: string };

export default function StoreScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const storeId: string = route?.params?.storeId ?? 's1';
  const spots = useAppStore((s) => s.spots);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const addToCart = useAppStore((s) => s.addToCart);
  const cart = useAppStore((s) => s.cart);
  const spot = spots.find((s) => s.id === storeId) ?? spots[0];
  const [favorited, setFavorited] = React.useState(spot?.isFavorite ?? false);
  const [service, setService] = React.useState<'Delivery' | 'Pickup'>('Delivery');
  const [category, setCategory] = React.useState<'Main' | 'Drinks' | 'Side' | 'Snacks'>('Main');

  const menu: MenuItem[] = React.useMemo(() => [
    { id: 'm1', name: 'Jollof Rice and Chicken with Coleslaw', description: '', price: 4500, rating: 4.2, reviews: 13, category: 'Main', image: 'https://picsum.photos/id/1080/160/160' },
    { id: 'm2', name: 'Fried Rice and Beef', description: '', price: 5200, rating: 4.4, reviews: 18, category: 'Main', image: 'https://picsum.photos/id/1060/160/160' },
    { id: 'm3', name: 'Cola Drink 50cl', description: '', price: 800, rating: 4.0, reviews: 11, category: 'Drinks', image: 'https://picsum.photos/id/1050/160/160' },
    { id: 'm4', name: 'Chicken Wings (4 pcs)', description: '', price: 3200, rating: 4.3, reviews: 9, category: 'Side', image: 'https://picsum.photos/id/1040/160/160' },
    { id: 'm5', name: 'Plantain Chips', description: '', price: 1200, rating: 4.1, reviews: 7, category: 'Snacks', image: 'https://picsum.photos/id/1035/160/160' },
  ], []);

  const filtered = React.useMemo(() => menu.filter((m) => m.category === category), [menu, category]);

  const onAdd = (item: MenuItem) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, store: spot?.title, rating: item.rating, reviews: item.reviews });
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.getParent()?.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } });
  };

  const toggleFav = () => {
    setFavorited((v) => !v);
    toggleSpotFavorite(spot.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: 'https://placehold.co/800x400/282C34/FFFFFF?text=Store+Image+Placeholder' }} style={styles.hero} />
          <Pressable onPress={goBack} accessibilityLabel="Back" style={[styles.heroBtn, styles.heroBtnLeft, { backgroundColor: theme.colors.card }]}> 
            <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => {}} accessibilityLabel="Search" style={[styles.heroBtn, styles.heroBtnRightMid, { backgroundColor: theme.colors.card }]}> 
            <Ionicons name="search" size={18} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable onPress={toggleFav} accessibilityLabel="Favorite" style={[styles.heroBtn, styles.heroBtnRight, { backgroundColor: theme.colors.card }]}> 
            <MaterialCommunityIcons name={favorited ? 'heart' : 'heart-outline'} size={18} color={favorited ? theme.colors.danger : theme.colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => {}} accessibilityLabel="More options" style={[styles.heroBtn, styles.heroBtnRightFar, { backgroundColor: theme.colors.card }]}> 
            <Feather name="more-horizontal" size={18} color={theme.colors.textPrimary} />
          </Pressable>
          <View style={[styles.fcBadge, { backgroundColor: '#6C3EE8' }]}> 
            <Text style={{ color: '#fff', fontWeight: '700' }}>FC</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 20 }}>{spot?.title ?? 'Store'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Ionicons name="location" size={14} color={theme.colors.accent} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>12, North Avenue, CP Street, Sagamu</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            <View>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>₦{spot?.deliveryFee.toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="currency-ngn" size={14} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Delivery Fee</Text>
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FontAwesome name="star" size={12} color="#F59E0B" />
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{spot?.rating.toFixed(2)} <Text style={{ color: theme.colors.textSecondary }}>(23)</Text></Text>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Rating</Text>
            </View>
            <View>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>~ 10 mins</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Earliest Arrival</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => setService('Delivery')} style={[styles.pill, { borderColor: theme.colors.border, backgroundColor: service === 'Delivery' ? theme.colors.card : 'transparent' }]}> 
                <Text style={{ color: theme.colors.textPrimary }}>Delivery</Text>
              </Pressable>
              <Pressable onPress={() => setService('Pickup')} style={[styles.pill, { borderColor: theme.colors.border, backgroundColor: service === 'Pickup' ? theme.colors.card : 'transparent' }]}> 
                <Text style={{ color: theme.colors.textPrimary }}>Pickup</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#D8F6E7' }}> 
                <Text style={{ color: theme.colors.success, fontWeight: '700' }}>Open</Text>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Closes 11:00 PM</Text>
            </View>
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 12 }} />

        <View style={{ paddingTop: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {(['Main','Drinks','Side','Snacks'] as const).map((tab) => {
              const active = tab === category;
              return (
                <Pressable key={tab} onPress={() => setCategory(tab)} style={{ marginRight: 16, paddingVertical: 12 }}> 
                  <Text style={{ color: active ? theme.colors.accent : theme.colors.textSecondary, fontWeight: active ? '700' : '600' }}>{tab}</Text>
                  <View style={{ height: 2, backgroundColor: active ? theme.colors.accent : 'transparent', marginTop: 8 }} />
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>{category}</Text>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
                <Image source={{ uri: item.image ?? 'https://picsum.photos/id/1040/120/120' }} style={{ width: 64, height: 64, borderRadius: 8 }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }} numberOfLines={2}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.rating.toFixed(1)} ({item.reviews})</Text>
                  </View>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 6 }}>₦ {item.price.toLocaleString()}</Text>
                </View>
                <Pressable onPress={() => onAdd(item)} accessibilityLabel="Add" style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}> 
                  <MaterialCommunityIcons name="plus" size={18} color={theme.colors.textPrimary} />
                </Pressable>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {!!cart.length && (
        <Pressable onPress={() => navigation.getParent()?.navigate('Cart')} style={[styles.footerBtn, { backgroundColor: '#000' }]}> 
          <MaterialCommunityIcons name="cart" size={18} color={theme.colors.accent} />
          <Text style={{ color: theme.colors.accent, marginLeft: 8, fontWeight: '700' }}>Ongoing Order</Text>
          <Feather name="chevron-right" size={16} color={theme.colors.accent} style={{ marginLeft: 8 }} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 220 },
  heroBtn: { position: 'absolute', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heroBtnLeft: { left: 12, top: 12 },
  heroBtnRightMid: { right: 60, top: 12 },
  heroBtnRight: { right: 12, top: 12 },
  heroBtnRightFar: { right: 12, top: 60 },
  fcBadge: { position: 'absolute', left: '50%', bottom: -18, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', transform: [{ translateX: -24 }] },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 16 },
  footerBtn: { position: 'absolute', left: 16, right: 16, bottom: 24, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});