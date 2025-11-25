import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (v: string) => void;
  onSubmit?: () => void;
};

export default function SearchBar({ placeholder = 'Search', value, onChangeText, onSubmit }: SearchBarProps) {
  const theme = useTheme();
  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      {
        shadowColor: theme.colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    ]}
      accessibilityLabel="Search input">
      <Ionicons name="search" size={18} color={theme.colors.icon} style={{ marginHorizontal: 8 }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        style={[styles.input, { color: theme.colors.textPrimary }]}
        returnKeyType="search"
      />
      <Pressable onPress={onSubmit} accessibilityLabel="Submit search" style={styles.submit}>
        <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Search</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  submit: {
    paddingHorizontal: 12,
  },
});