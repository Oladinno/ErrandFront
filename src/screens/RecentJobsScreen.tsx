import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../state/store';
import JobCard from '../components/JobCard';

export default function RecentJobsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const jobs = useAppStore((s) => s.jobs);
  const active = jobs.filter((j) => j.status === 'active');

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back" style={styles.backBtn}> 
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Recent Jobs</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {active.map((j) => (
          <View key={j.id} style={{ marginBottom: 12 }}>
            <JobCard title={j.title} description={j.description ?? 'No description'} category={j.category} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
});