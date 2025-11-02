import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import AppErrorBoundary from './src/components/AppErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <RootNavigator />
      </AppErrorBoundary>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
