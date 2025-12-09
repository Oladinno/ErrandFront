import { act } from '@testing-library/react-native';
import { useAppStore, Product } from '../../src/state/store';

describe('App store logic', () => {
  beforeEach(() => {
    const s = useAppStore.getState();
    s.clearCart();
  });

  test('addToCart and updateCartQty manage quantities and removal', () => {
    act(() => { useAppStore.getState().addToCart({ id: 'p1', name: 'Item', price: 1000 } as Product); });
    expect(useAppStore.getState().cart.length).toBe(1);
    act(() => { useAppStore.getState().updateCartQty('p1', 3); });
    expect(useAppStore.getState().cart[0].qty).toBe(3);
    act(() => { useAppStore.getState().updateCartQty('p1', 0); });
    expect(useAppStore.getState().cart.length).toBe(0);
  });

  test('placeOrderFromCart moves items to orders and clears cart', () => {
    act(() => { useAppStore.getState().addToCart({ id: 'p1', name: 'A', price: 1500, qty: 2 } as Product); });
    const id = useAppStore.getState().placeOrderFromCart('10 mins');
    expect(id).toMatch(/^o\d+/);
    expect(useAppStore.getState().cart.length).toBe(0);
    const order = useAppStore.getState().orders.find((o) => o.id === id)!;
    expect(order.total).toBe(3000);
  });

  test('updateJobStatus updates job state', () => {
    const before = useAppStore.getState().jobs.find((j) => j.id === 'j2')!;
    expect(before.status).toBe('saved');
    act(() => { useAppStore.getState().updateJobStatus('j2', 'active'); });
    expect(useAppStore.getState().jobs.find((j) => j.id === 'j2')!.status).toBe('active');
  });

  test('toggleSaveProfessional toggles saved ids', () => {
    act(() => { useAppStore.getState().toggleSaveProfessional('pr1'); });
    expect(useAppStore.getState().savedProfessionalIds.includes('pr1')).toBeTruthy();
    act(() => { useAppStore.getState().toggleSaveProfessional('pr1'); });
    expect(useAppStore.getState().savedProfessionalIds.includes('pr1')).toBeFalsy();
  });

  test('toggleSpotFavorite flips favorite flag', () => {
    const first = useAppStore.getState().spots[0];
    const initial = first.isFavorite;
    act(() => { useAppStore.getState().toggleSpotFavorite(first.id); });
    expect(useAppStore.getState().spots.find((s) => s.id === first.id)!.isFavorite).toBe(!initial);
  });
});

