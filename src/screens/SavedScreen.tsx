import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme';

export default function SavedScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Saved" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: theme.colors.textSecondary }}>Your saved items.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});