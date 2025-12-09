import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';
import { useAppStore } from '../state/store';

type RowProps = { label: string; onPress?: () => void };
const Row = React.memo(({ label, onPress }: RowProps) => {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.row]}> 
      <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
    </Pressable>
  );
});

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const [darkMode, setDarkMode] = React.useState(mode === 'dark');
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  React.useEffect(() => {
    const req = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) Alert.alert('Permission required', 'Location access is needed for delivery');
        } else {
          Alert.alert('Location', 'Allow location access in Settings to improve delivery accuracy');
        }
      } catch {}
    };
    req();
  }, []);
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <Pressable accessibilityLabel="Back" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } })} style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}> 
        <View style={[styles.divider, { borderColor: theme.colors.border }]} />
        <View style={styles.section}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Account</Text>
          <Row label="Edit Profile" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Profile' } })} />
          <Row label="Change Password" />
          <Row label="Notifications" />
        </View>

        <View style={[styles.divider, { borderColor: theme.colors.border }]} />
        <View style={styles.section}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>App Settings</Text>
          <View style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={(v) => { setDarkMode(v); setMode(v ? 'dark' : 'light'); }} />
          </View>
          <View style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>Location Permissions</Text>
            <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
          </View>
        </View>

        <View style={[styles.divider, { borderColor: theme.colors.border }]} />
        <View style={styles.section}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Legal / Support</Text>
          <Row label="Support" onPress={() => navigation.navigate('Support')} />
          <Row label="Privacy Policy" />
          <Row label="Terms of Service" />
        </View>

        <View style={styles.footer}> 
          <Pressable accessibilityRole="button" accessibilityLabel="Log Out" style={[styles.logoutBtn]}> 
            <Text style={styles.logoutText}>Log Out</Text>
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
  divider: { borderBottomWidth: 1 },
  section: { paddingVertical: 16 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  textPrimary: { fontSize: 14 },
  chevron: { fontSize: 18 },
  footer: { marginTop: 16 },
  logoutBtn: { width: '100%', backgroundColor: '#EB5757', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600' },
});
