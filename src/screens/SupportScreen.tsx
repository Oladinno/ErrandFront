import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';

type RowProps = { label: string };
const Row = React.memo(({ label }: RowProps) => {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.row}> 
      <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
    </Pressable>
  );
});

export default function SupportScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <Pressable accessibilityLabel="Back" onPress={() => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } })} style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Support</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}> 
        <View style={styles.searchWrap}> 
          <TextInput accessibilityLabel="Search Help Topics" placeholder="Search Help Topics..." placeholderTextColor={theme.colors.textSecondary} style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]} />
        </View>

        <View style={{ paddingVertical: 8 }}> 
          <Row label="FAQs" />
          <Row label="Order Issues" />
          <Row label="Delivery Partner Help" />
        </View>

        <View style={{ marginTop: 24 }}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Contact Us</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Live Chat" style={styles.row} onPress={() => navigation.navigate('Messages')}> 
            <Text style={{ color: '#2ECC71', fontWeight: '600' }}>Live Chat</Text>
            <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Call Us" style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>Call Us</Text>
            <Text style={[styles.chevron, { color: theme.colors.textPrimary }]}>›</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Send an Email" style={styles.row}> 
            <Text style={[styles.textPrimary, { color: theme.colors.textPrimary }]}>Send an Email</Text>
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
  searchWrap: { marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  textPrimary: { fontSize: 14 },
  chevron: { fontSize: 18 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
});
