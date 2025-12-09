import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

type TabKey = 'active' | 'completed' | 'cancelled';

type Job = { id: string; title: string; status: TabKey; location?: string };

const JobCard = React.memo(({ job }: { job: Job }) => {
  const theme = useTheme();
  return (
    <View style={[styles.card, { borderColor: theme.colors.border }]}> 
      <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{job.title}</Text>
      <Text style={{ color: theme.colors.textPrimary }}>Status: {job.status}</Text>
      <Text style={{ color: theme.colors.textPrimary }}>Location: {job.location ?? 'Unknown'}</Text>
    </View>
  );
});

export default function MyJobsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const [tab, setTab] = React.useState<TabKey>('active');
  const jobs: Job[] = [
    { id: 'j1', title: 'Fix leaking sink', status: 'active', location: 'Sagamu' },
    { id: 'j2', title: 'Replace tap', status: 'completed', location: 'Sagamu' },
    { id: 'j3', title: 'Install cabinet hinges', status: 'cancelled', location: 'Sagamu' },
  ];
  const filtered = jobs.filter((j) => j.status === tab);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <Pressable accessibilityLabel="Back" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } })} style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>My Jobs</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={{ paddingHorizontal: 16 }}> 
        <View style={styles.tabs}> 
          {(['active','completed','cancelled'] as TabKey[]).map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={k} onPress={() => setTab(k)} style={styles.tabBtn}> 
              <Text style={{ color: k === tab ? '#2ECC71' : theme.colors.textPrimary, fontWeight: k === tab ? '600' : '400' }}>{k[0].toUpperCase() + k.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 }}> 
        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: theme.colors.border }]}> 
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No {tab} jobs</Text>
            <Text style={{ color: theme.colors.textPrimary }}>Post a job to get started</Text>
          </View>
        ) : (
          filtered.map((j) => <JobCard key={j.id} job={j} />)
        )}
      </ScrollView>
      <View style={styles.bottomBar}> 
        <Pressable accessibilityRole="button" accessibilityLabel="Post a New Job" style={styles.ctaBtn} onPress={() => navigation.navigate('App', { screen: 'PostJob' })}> 
          <Text style={styles.ctaText}>Post a New Job/Service</Text>
        </Pressable>
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
  card: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 12 },
  cardTitle: { fontWeight: '600', marginBottom: 4 },
  emptyCard: { borderWidth: 1, borderRadius: 8, padding: 24, alignItems: 'center' },
  emptyTitle: { fontWeight: '600', marginBottom: 8 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  ctaBtn: { width: '100%', backgroundColor: '#2ECC71', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600' },
});
