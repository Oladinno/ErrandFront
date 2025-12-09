import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

const Row = React.memo(({ label }: { label: string }) => {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.row}> 
      <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
    </Pressable>
  );
});

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}> 
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>My Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}> 
        <View style={[styles.card, { borderColor: theme.colors.border }]}> 
          <View style={{ alignItems: 'center', marginBottom: 12 }}> 
            <View style={styles.avatar}> 
              <Text style={{ color: theme.colors.textPrimary }}>U</Text>
            </View>
          </View>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>Femi</Text>
          <Text style={{ color: theme.colors.textPrimary }}>femi@example.com</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Edit Profile" style={[styles.editBtn]}> 
            <Text style={{ color: '#fff', fontWeight: '600' }}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 24 }}> 
          <Pressable accessibilityLabel="My Activity" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Activity' } })} style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>My Activity (Orders)</Text>
            <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
          </Pressable>
          <Row label="Payment Methods" />
          <Row label="Addresses" />
          <Pressable accessibilityLabel="Saved" onPress={() => navigation.navigate('Saved')} style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>Saved</Text>
            <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 16 }}> 
          <Pressable accessibilityLabel="Send a Package" onPress={() => navigation.navigate('Send a Package')} style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>Send a Package</Text>
            <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
          </Pressable>
          <Pressable accessibilityLabel="My Jobs" onPress={() => navigation.navigate('My Jobs')} style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>My Jobs</Text>
            <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { textAlign: 'center', fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 8, padding: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700' },
  editBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#2ECC71', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  textPrimary: { fontSize: 14 },
  chevron: { fontSize: 18 },
});
