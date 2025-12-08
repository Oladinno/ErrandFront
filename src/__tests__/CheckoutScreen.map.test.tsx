import { xyToCoordinate, coordinateToXY, computePOIs } from '../../src/screens/CheckoutScreen';

describe('CheckoutScreen map helpers', () => {
  const region = { latitude: 6.83, longitude: 3.646, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  const layout = { width: 200, height: 200 };

  test('xyToCoordinate maps to region bounds', () => {
    const topLeft = xyToCoordinate(0, 0, layout, region);
    const bottomRight = xyToCoordinate(layout.width, layout.height, layout, region);
    expect(topLeft.longitude).toBeCloseTo(region.longitude - region.longitudeDelta / 2);
    expect(topLeft.latitude).toBeCloseTo(region.latitude + region.latitudeDelta / 2);
    expect(bottomRight.longitude).toBeCloseTo(region.longitude + region.longitudeDelta / 2);
    expect(bottomRight.latitude).toBeCloseTo(region.latitude - region.latitudeDelta / 2);
  });

  test('coordinateToXY inverts xyToCoordinate', () => {
    const center = { latitude: region.latitude, longitude: region.longitude };
    const xy = coordinateToXY(center, layout, region);
    const recon = xyToCoordinate(xy.x, xy.y, layout, region);
    expect(recon.latitude).toBeCloseTo(center.latitude);
    expect(recon.longitude).toBeCloseTo(center.longitude);
  });

  test('computePOIs returns Home and Food Court markers', () => {
    const pois = computePOIs(region);
    const ids = pois.map((p) => p.id);
    expect(ids).toContain('home');
    expect(ids).toContain('store');
    const home = pois.find((p) => p.id === 'home')!;
    expect(home.coordinate.latitude).toBeCloseTo(region.latitude);
    expect(home.coordinate.longitude).toBeCloseTo(region.longitude);
  });
});

