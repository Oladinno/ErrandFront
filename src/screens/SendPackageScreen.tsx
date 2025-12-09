import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

export default function SendPackageScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const [pickupAddress, setPickupAddress] = React.useState('');
  const [pickupName, setPickupName] = React.useState('');
  const [pickupPhone, setPickupPhone] = React.useState('');
  const [dropAddress, setDropAddress] = React.useState('');
  const [dropName, setDropName] = React.useState('');
  const [dropPhone, setDropPhone] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [size, setSize] = React.useState<'small'|'medium'|'large'>('small');
  const [error, setError] = React.useState<string | null>(null);

  const validate = () => {
    if (!pickupAddress || !pickupName || !pickupPhone || !dropAddress || !dropName || !dropPhone) {
      return 'All fields are required';
    }
    const phoneOk = (p: string) => /^[+]?[0-9\s-]{7,}$/.test(p);
    if (!phoneOk(pickupPhone) || !phoneOk(dropPhone)) return 'Enter valid phone numbers';
    return null;
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <Pressable accessibilityLabel="Back" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } })} style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Send a Package</Text>
        <View style={{ width: 28 }} />
        <Text style={{ color: theme.colors.textPrimary, textAlign: 'center' }}>Step 1 of 3</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Pick-up Details</Text>
        <TextInput placeholder="Address" value={pickupAddress} onChangeText={setPickupAddress} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />
        <TextInput placeholder="Contact Name" value={pickupName} onChangeText={setPickupName} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />
        <TextInput placeholder="Contact Phone" value={pickupPhone} onChangeText={setPickupPhone} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary, marginBottom: 24 }]} />

        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Drop-off Details</Text>
        <TextInput placeholder="Address" value={dropAddress} onChangeText={setDropAddress} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />
        <TextInput placeholder="Recipient Name" value={dropName} onChangeText={setDropName} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />
        <TextInput placeholder="Recipient Phone" value={dropPhone} onChangeText={setDropPhone} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary, marginBottom: 24 }]} />

        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Package Details</Text>
        <TextInput placeholder="Description" multiline numberOfLines={4} value={description} onChangeText={setDescription} placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}> 
          {(['small','medium','large'] as const).map((opt) => (
            <Pressable key={opt} accessibilityRole="button" accessibilityLabel={opt} onPress={() => setSize(opt)} style={[styles.sizeBtn, { backgroundColor: size===opt ? '#2ECC71' : '#E5E7EB' }]}> 
              <Text style={{ color: size===opt ? '#fff' : theme.colors.textPrimary }}>{opt}</Text>
            </Pressable>
          ))}
        </View>

        {!!error && <Text style={{ color: theme.colors.danger, marginBottom: 8 }}>{error}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to Pricing"
          style={styles.ctaBtn}
          onPress={() => {
            const e = validate();
            setError(e);
            if (e) { Alert.alert('Invalid Input', e); return; }
            const draft = { pickupAddress, pickupName, pickupPhone, dropAddress, dropName, dropPhone, description, size } as any;
            navigation.navigate('Checkout', { draft });
          }}
        > 
          <Text style={styles.ctaText}>Continue to Pricing</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { textAlign: 'center', fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  sizeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  ctaBtn: { width: '100%', backgroundColor: '#2ECC71', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600' },
});
