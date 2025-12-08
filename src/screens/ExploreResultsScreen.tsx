import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../state/store';
import Card from '../components/Card';

export default function ExploreResultsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const type: 'top_spots' | 'recommended' = route?.params?.type ?? 'top_spots';
  const spots = useAppStore((s) => s.spots);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const title = type === 'top_spots' ? 'Top Spots' : 'Recommended';

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back" style={styles.backBtn}> 
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={spots}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16 }}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
});