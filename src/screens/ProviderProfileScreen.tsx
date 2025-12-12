import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';
import { useTheme } from '../hooks/useTheme';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useAppStore } from '../state/store';

type ProviderProfileRouteParams = { providerId: string };

export default function ProviderProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const route = useRoute();
  const { providerId } = (route as any).params ?? {} as ProviderProfileRouteParams;
  const pros = useAppStore((s) => s.professionals);
  const jobs = useAppStore((s) => s.jobs);
  const pro = pros.find((p) => p.id === providerId) ?? pros[0];
  const pastJobs = jobs.filter((j) => j.professional === pro?.name);

  const [availability, setAvailability] = React.useState<{ status?: string; nextWindow?: string } | null>(null);
  const [pricing, setPricing] = React.useState<{ basePrice?: number; currency?: string; variations?: { name: string; price: number; currency: string }[] } | null>(null);
  const [profile, setProfile] = React.useState<{ description?: string; whatIDoSummary?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const pid = providerId ?? pro?.id ?? 'pr1';
        const [a, pz, pf] = await Promise.all([
          fetch(`/api/v1/availability?providerId=${pid}`),
          fetch(`/api/v1/pricing?providerId=${pid}`),
          fetch(`/api/v1/profile?providerId=${pid}`),
        ]);
        if (!mounted) return;
        const av = a.ok ? await a.json() : null;
        const pr = pz.ok ? await pz.json() : null;
        const prof = pf.ok ? await pf.json() : null;
        setAvailability(av);
        setPricing(pr);
        setProfile(prof);
      } catch (e: any) {
        setError('Unable to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [providerId]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}> 
        <Pressable accessibilityLabel="Back" onPress={() => navigation.goBack()} style={styles.iconBtn}> 
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={{ width: 36 }} />
        <Pressable accessibilityLabel="More options" style={styles.iconBtn}> 
          <Feather name="more-horizontal" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}> 
        <View style={{ alignItems: 'center' }}>
          <Image source={{ uri: 'https://picsum.photos/id/1027/200/200' }} style={styles.avatar} />
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{pro?.name ?? 'Professional'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="tools" size={14} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>{pro?.category ?? 'Service'}</Text>
          </View>
        </View>

        <View style={[styles.statsBar, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
          <View style={styles.statItem}> 
            <MaterialCommunityIcons name="currency-ngn" size={16} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{pricing?.basePrice ? `₦${pricing.basePrice}` : '₦—'}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Price Point</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}> 
            <FontAwesome name="star" size={14} color="#F59E0B" />
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>4.15 (23)</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Rating</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}> 
            <Feather name="clock" size={16} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{availability?.nextWindow ?? '~ —'}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Earliest Arrival</Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <View style={[styles.availability, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
            <View style={[styles.dot, { backgroundColor: availability?.status === 'available' ? '#18A558' : availability?.status === 'busy' ? '#F59E0B' : '#9CA3AF' }]} />
            <Text style={{ color: availability?.status === 'available' ? '#18A558' : availability?.status === 'busy' ? '#F59E0B' : theme.colors.textSecondary, fontWeight: '700' }}>
              {availability?.status ? availability.status.charAt(0).toUpperCase() + availability.status.slice(1) : 'Loading'}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Description</Text>
          {loading ? (
            <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
          ) : error ? (
            <Text style={{ color: theme.colors.danger }}>Unable to load data</Text>
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>
              {profile?.description ?? '—'}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>What I Do</Text>
          {profile?.whatIDoSummary ? (
            profile.whatIDoSummary.split(/\.|\n/).filter(Boolean).slice(0,4).map((txt) => (
              <View key={txt} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                <Text style={{ color: theme.colors.textSecondary }}>{'•'}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>{txt.trim()}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>—</Text>
          )}
        </View>

        {!!pricing?.variations?.length && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Pricing</Text>
            <View style={[styles.table, { borderColor: theme.colors.border }]}> 
              {pricing.variations.map((v, i) => (
                <View key={v.name} style={[styles.tableRow, { borderColor: theme.colors.border, backgroundColor: i % 2 === 0 ? theme.colors.card : theme.colors.surface }]}> 
                  <Text style={{ color: theme.colors.textPrimary, flex: 1 }}>{v.name}</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>{`₦${v.price}`}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Past Jobs</Text>
          {pastJobs.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary }}>No past jobs recorded.</Text>
          ) : (
            pastJobs.slice(0, 3).map((j, idx) => (
              <PastJobItem
                key={j.id}
                title={j.title}
                ratingLabel={idx === 0 ? '4.5' : idx === 1 ? '4.3' : '4.2'}
                ratingCount={idx === 0 ? 23 : idx === 1 ? 13 : 12}
                showSeeAll={idx === 0}
                onSeeAll={() => navigation.getParent()?.navigate('App', { screen: 'RecentJobs' })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PastJobItem({ title, ratingLabel, ratingCount, showSeeAll, onSeeAll }: { title: string; ratingLabel: string; ratingCount: number; showSeeAll?: boolean; onSeeAll?: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.jobItem, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
      <View style={styles.jobThumb} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <FontAwesome name="star" size={12} color="#F59E0B" />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{ratingLabel} ({ratingCount})</Text>
        </View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.checkWrap, { backgroundColor: '#18A558' }]}> 
          <Feather name="check" size={14} color={'#fff'} />
        </View>
        {showSeeAll && (
          <Pressable accessibilityLabel="See all" onPress={onSeeAll} style={{ marginTop: 8 }}>
            <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>See all</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, marginTop: 12 },
  name: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  statsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  statItem: { alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1 },
  separator: { width: 1, height: 24 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#18A558' },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  jobItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 8 },
  jobThumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#E5E7EB' },
  checkWrap: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  table: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
});
