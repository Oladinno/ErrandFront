import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function JobPostedScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const jobId: string | undefined = route?.params?.jobId;
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <MaterialCommunityIcons name="check-circle" size={96} color={theme.colors.accent} />
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '800', fontSize: 20, textAlign: 'center', marginTop: 12 }}>Job Posted Successfully</Text>
        {!!jobId && <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6 }}>Reference: {jobId}</Text>}
        <Pressable onPress={() => navigation.getParent()?.navigate('App', { screen: 'Tabs', params: { screen: 'Activity' } })} style={[styles.btn, { backgroundColor: theme.colors.accent }]} accessibilityLabel="View Jobs">
          <Text style={{ color: '#fff', fontWeight: '700' }}>View Jobs</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btn: { marginTop: 16, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
});