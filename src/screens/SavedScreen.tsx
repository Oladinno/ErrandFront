import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { View, Text, ScrollView, Pressable, StyleSheet, Image, FlatList, Animated, useWindowDimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

type TabKey = 'restaurants' | 'dishes' | 'collections' | 'jobs';

export default function SavedScreen() {
  const theme = useTheme();
  const [tab, setTab] = React.useState<TabKey>('restaurants');
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const spots = useAppStore((s) => s.spots);
  const professionals = useAppStore((s) => s.professionals);
  const savedProfessionalIds = useAppStore((s) => s.savedProfessionalIds);
  const jobs = useAppStore((s) => s.jobs);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const updateJobStatus = useAppStore((s) => s.updateJobStatus);
  const toggleSaveProfessional = useAppStore((s) => s.toggleSaveProfessional);
  const { width } = useWindowDimensions();
  const numColumns = width >= 640 ? 2 : 1;
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <Pressable accessibilityLabel="Back" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } })} style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Saved</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={{ paddingHorizontal: 16 }}> 
        <View style={styles.tabs}> 
          {(['restaurants','dishes','collections','jobs'] as TabKey[]).map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={k} onPress={() => setTab(k)} style={styles.tabBtn}> 
              <Text style={[styles.tabText, { color: k === tab ? theme.colors.accent : theme.colors.textPrimary, fontWeight: k === tab ? '600' : '400' }]}>{k[0].toUpperCase() + k.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 24, flex: 1 }}> 
        {tab === 'restaurants' && (
          spots.filter((sp) => sp.isFavorite).length === 0 ? (
            <View style={[styles.emptyCard, { borderColor: theme.colors.border }]}> 
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No saved restaurants</Text>
              <Text style={{ color: theme.colors.textPrimary }}>Tap the heart/bookmark to save items</Text>
            </View>
          ) : (
            <FlatList
              testID="restaurants-grid"
              data={spots.filter((sp) => sp.isFavorite)}
              keyExtractor={(sp) => sp.id}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
              renderItem={({ item: sp }) => {
                const scale = new Animated.Value(1);
                const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
                const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
                return (
                  <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
                    <Pressable
                      onPress={() => navigation.navigate('App', { screen: 'Store', params: { storeId: sp.id } })}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      accessibilityLabel={sp.title}
                      style={[styles.cardInner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    >
                      {sp.image ? (
                        <Image source={{ uri: sp.image }} style={styles.preview} />
                      ) : (
                        <View style={[styles.preview, { backgroundColor: theme.colors.surface }]} />
                      )}
                      <View style={styles.cardInfo}> 
                        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{sp.title}</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>{sp.category}</Text>
                        <Text style={[styles.cardTimestamp, { color: theme.colors.textSecondary }]}>Saved recently</Text>
                        <View style={styles.cardActions}> 
                          <Pressable onPress={() => navigation.navigate('App', { screen: 'Store', params: { storeId: sp.id } })} style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}> 
                            <Text style={styles.actionTextLight}>Open</Text>
                          </Pressable>
                          <Pressable onPress={() => toggleSpotFavorite(sp.id)} style={[styles.actionBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}> 
                            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Unsave</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              }}
            />
          )
        )}
        {tab === 'dishes' && (
          <View>
            <View style={[styles.emptyCard, { borderColor: theme.colors.border }]}> 
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No saved dishes</Text>
              <Text style={{ color: theme.colors.textPrimary }}>Save dishes from restaurant menus</Text>
            </View>
          </View>
        )}
        {tab === 'collections' && (
          savedProfessionalIds.length === 0 ? (
            <View style={[styles.emptyCard, { borderColor: theme.colors.border }]}> 
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No saved collections</Text>
              <Text style={{ color: theme.colors.textPrimary }}>Save service providers to build collections</Text>
            </View>
          ) : (
            <FlatList
              testID="collections-grid"
              data={professionals.filter((p) => savedProfessionalIds.includes(p.id))}
              keyExtractor={(p) => p.id}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
              renderItem={({ item: p }) => {
                const scale = new Animated.Value(1);
                const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
                const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
                const initials = p.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
                    <Pressable
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      accessibilityLabel={p.name}
                      style={[styles.cardInner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    >
                      <View style={[styles.preview, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }]}> 
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{initials}</Text>
                      </View>
                      <View style={styles.cardInfo}> 
                        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{p.name}</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>{p.category}</Text>
                        <Text style={[styles.cardTimestamp, { color: theme.colors.textSecondary }]}>Saved recently</Text>
                        <View style={styles.cardActions}> 
                          <Pressable style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}> 
                            <Text style={styles.actionTextLight}>Contact</Text>
                          </Pressable>
                          <Pressable onPress={() => toggleSaveProfessional(p.id)} style={[styles.actionBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}> 
                            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Unsave</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              }}
            />
          )
        )}
        {tab === 'jobs' && (
          jobs.filter((j) => j.status === 'saved').length === 0 ? (
            <View style={[styles.emptyCard, { borderColor: theme.colors.border }]}> 
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No saved jobs</Text>
              <Text style={{ color: theme.colors.textPrimary }}>Save jobs to review later</Text>
            </View>
          ) : (
            <FlatList
              testID="jobs-grid"
              data={jobs.filter((j) => j.status === 'saved')}
              keyExtractor={(j) => j.id}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
              renderItem={({ item: j }) => {
                const scale = new Animated.Value(1);
                const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
                const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
                return (
                  <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
                    <Pressable
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      accessibilityLabel={j.title}
                      style={[styles.cardInner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    >
                      <View style={[styles.preview, { backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }]}> 
                        <Feather name="briefcase" size={22} color={theme.colors.textSecondary} />
                      </View>
                      <View style={styles.cardInfo}> 
                        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{j.title}</Text>
                        {!!j.description && <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>{j.description}</Text>}
                        <Text style={[styles.cardTimestamp, { color: theme.colors.textSecondary }]}>Saved recently</Text>
                        <View style={styles.cardActions}> 
                          <Pressable onPress={() => updateJobStatus(j.id, 'active')} style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}> 
                            <Text style={styles.actionTextLight}>Activate</Text>
                          </Pressable>
                          <Pressable onPress={() => updateJobStatus(j.id, 'active')} style={[styles.actionBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}> 
                            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Unsave</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              }}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { textAlign: 'center', fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14 },
  emptyCard: { borderWidth: 1, borderRadius: 8, padding: 24, alignItems: 'center' },
  emptyTitle: { fontWeight: '600', marginBottom: 8 },
  card: { flex: 1, marginBottom: 16, marginRight: 12 },
  cardInner: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  preview: { width: '100%', height: 140 },
  cardInfo: { padding: 12, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, fontWeight: '500' },
  cardTimestamp: { fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  actionTextLight: { color: '#fff', fontWeight: '700' },
  actionText: { fontWeight: '700' },
});
