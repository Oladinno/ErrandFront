import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import appConfig from '../../app.json';

type Coordinate = { latitude: number; longitude: number };
type MapRegion = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
type MapMarker = { id: string; title: string; coordinate: Coordinate; color?: string };

type GoogleMapViewProps = {
  region: MapRegion;
  markers?: MapMarker[];
  polyline?: Coordinate[];
  showsUserLocation?: boolean;
  onSelect?: (c: Coordinate) => void;
  onLoad?: () => void;
  onRegionChange?: (r: MapRegion) => void;
  style?: any;
  testID?: string;
};

export default function GoogleMapView({ region, markers = [], polyline, showsUserLocation, onSelect, onLoad, onRegionChange, style, testID }: GoogleMapViewProps) {
  const apiKey: string | undefined = (appConfig as any)?.expo?.android?.config?.googleMaps?.apiKey;
  const data = { region, markers, polyline, showsUserLocation };
  const html = `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width" />
      <style>
        html, body { margin: 0; padding: 0; height: 100%; }
        #map { width: 100%; height: 100%; }
      </style>
      <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey ?? ''}&libraries=geometry"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const initial = ${JSON.stringify(data)};
        const center = { lat: initial.region.latitude, lng: initial.region.longitude };
        const map = new google.maps.Map(document.getElementById('map'), {
          center,
          zoom: 15,
          clickableIcons: false,
          disableDefaultUI: true,
        });

        (initial.markers || []).forEach(function(m) {
          const marker = new google.maps.Marker({
            position: { lat: m.coordinate.latitude, lng: m.coordinate.longitude },
            map,
            title: m.title,
            icon: m.color ? { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: m.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1 } : undefined,
          });
        });

        if (initial.polyline && initial.polyline.length) {
          const path = initial.polyline.map(function(p) { return { lat: p.latitude, lng: p.longitude }; });
          const pl = new google.maps.Polyline({ path, geodesic: true, strokeColor: '#4285F4', strokeOpacity: 1.0, strokeWeight: 4 });
          pl.setMap(map);
        }

        google.maps.event.addListenerOnce(map, 'idle', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'load' }));
          }
        });

        google.maps.event.addListener(map, 'click', function(e) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', coord: { latitude: e.latLng.lat(), longitude: e.latLng.lng() } }));
          }
        });

        google.maps.event.addListener(map, 'idle', function() {
          try {
            const c = map.getCenter();
            const b = map.getBounds();
            var latDelta = 0.02, lonDelta = 0.02;
            if (b) {
              const ne = b.getNorthEast();
              const sw = b.getSouthWest();
              latDelta = Math.abs(ne.lat() - sw.lat());
              lonDelta = Math.abs(ne.lng() - sw.lng());
            }
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'region', region: { latitude: c.lat(), longitude: c.lng(), latitudeDelta: latDelta, longitudeDelta: lonDelta } }));
            }
          } catch (err) {}
        });
      </script>
    </body>
  </html>`;

  return (
    <View style={style} testID={testID}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'load') onLoad?.();
            if (msg.type === 'select') onSelect?.(msg.coord);
            if (msg.type === 'region') onRegionChange?.(msg.region);
          } catch {}
        }}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
      />
    </View>
  );
}

