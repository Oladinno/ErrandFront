import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../state/store';

export default function ProfileScreen() {
  const theme = useTheme();
  const toggleMode = useAppStore((s) => s.toggleMode);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 16 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Femi</Text>
          <Text style={{ color: theme.colors.textSecondary }}>Hello there 👋</Text>
        </View>
        <Pressable onPress={toggleMode} style={{ backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 16 }}>
          <Text style={{ color: theme.colors.textPrimary }}>Toggle Theme (Light/Dark)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});