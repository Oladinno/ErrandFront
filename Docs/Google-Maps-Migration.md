Google Maps migration summary

- Removed native maps and replaced with Google Maps JavaScript API rendered in a `WebView`.
- Added `src/components/GoogleMapView.tsx` as the unified map component.
- Updated `CheckoutScreen.tsx` to use `NativeCheckoutMap` built on `GoogleMapView` with selection and region change.
- Updated `OrderTrackingScreen.tsx` to use `GoogleMapView` with vendor, destination, rider markers and a polyline.
- Configured Android key in `app.json` under `android.config.googleMaps.apiKey`.
- Kept existing location flow using `expo-location` to initialize map region.
- Removed `react-native-maps` and added `react-native-webview`.
- Tests updated to mock `GoogleMapView` instead of native maps.

Usage notes

- Add markers by passing `markers: Array<{ id, title, coordinate, color }>`.
- Listen for `onSelect` to capture tap coordinates.
- Listen for `onRegionChange` to observe center and deltas.
- Provide `polyline` as an array of coordinates for route drawing.
- Ensure `app.json` contains the valid API key and that the key has Maps JavaScript API enabled.

Compatibility

- `NativeCheckoutMap` keeps the same props contract used previously.
- Location services continue to use `expo-location` permissions and GPS.
