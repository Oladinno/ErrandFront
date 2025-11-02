import { create } from 'zustand';
import { ThemeMode } from '../theme';

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  store?: string;
};

export type Order = {
  id: string;
  status: 'ongoing' | 'past';
  items: Product[];
  total: number;
};

export type Job = {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'closed' | 'saved';
  professional?: string;
};

export type AppState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  cart: Product[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  orders: Order[];
  jobs: Job[];
};

export const useAppStore = create<AppState>((set) => ({
  mode: 'light',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
  cart: [],
  addToCart: (p) => set((s) => ({ cart: [...s.cart, p] })),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
  orders: [
    {
      id: 'o1',
      status: 'ongoing',
      items: [
        { id: 'p1', name: 'Jollof Rice', price: 2500, store: 'FoodCourt' },
        { id: 'p2', name: 'Chicken Shawarma', price: 4200, store: 'FoodCourt' },
      ],
      total: 6700,
    },
    {
      id: 'o2',
      status: 'past',
      items: [{ id: 'p3', name: 'Chips', price: 1300, store: 'FoodCourt' }],
      total: 1300,
    },
  ],
  jobs: [
    {
      id: 'j1',
      title: 'Fix leaking kitchen sink',
      category: 'Plumber',
      status: 'active',
      professional: 'Johnson Smith',
    },
    { id: 'j2', title: 'Replace tap', category: 'Plumber', status: 'saved' },
  ],
}));