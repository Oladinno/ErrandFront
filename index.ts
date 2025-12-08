import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';
const shouldMock = process.env.EXPO_PUBLIC_USE_MOCKS === 'true' || (typeof __DEV__ !== 'undefined' && __DEV__);
if (shouldMock) {
  try {
    // Dynamically load to avoid bundling errors when MSW is not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startNativeMocks } = require('./src/mocks/native');
    startNativeMocks();
  } catch (e) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { startFetchMock } = require('./src/mocks/polyfill');
      startFetchMock();
    } catch {}
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
