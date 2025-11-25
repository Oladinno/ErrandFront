import { create } from 'zustand';
import { ThemeMode } from '../theme';

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  store?: string;
  rating?: number;
  reviews?: number;
};

export type Order = {
  id: string;
  status: 'ongoing' | 'past';
  items: Product[];
  total: number;
  eta?: string;
};

export type Job = {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'closed' | 'saved';
  professional?: string;
  description?: string;
  offersCount?: number;
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
  spots: Spot[];
  professionals: Professional[];
  savedProfessionalIds: string[];
  toggleSaveProfessional: (id: string) => void;
  toggleSpotFavorite: (id: string) => void;
};

export type Spot = {
  id: string;
  title: string;
  category: string;
  image?: string;
  rating: number;
  deliveryTime: string;
  isFavorite: boolean;
  deliveryFee: number;
  promoBadge: string | null;
};

export type Professional = {
  id: string;
  name: string;
  category: string;
  location: string;
  distanceKm: number;
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
        { id: 'p1', name: 'Jollof Rice', price: 2500, store: 'FoodCourt', rating: 4.2, reviews: 13 },
        { id: 'p2', name: 'Chicken Shawarma', price: 4200, store: 'FoodCourt', rating: 4.2, reviews: 13 },
      ],
      total: 6700,
      eta: '12-25 mins',
    },
    {
      id: 'o2',
      status: 'past',
      items: [{ id: 'p3', name: 'Chips', price: 1300, store: 'FoodCourt', rating: 4.1, reviews: 8 }],
      total: 1300,
      eta: '12 mins',
    },
  ],
  jobs: [
    {
      id: 'j1',
      title: 'Fix leaking kitchen sink',
      category: 'Plumber',
      status: 'active',
      professional: 'Johnson Smith',
      description: 'My kitchen sink has been leaking underneath for the past 2 weeks and the water is damaging my cabinet. Please help fix and replace the tap.',
      offersCount: 12,
    },
    { id: 'j2', title: 'Replace tap', category: 'Plumber', status: 'saved', description: 'Replace bathroom tap and check for minor leaks.', offersCount: 4 },
    { id: 'j3', title: 'Install kitchen cabinet hinges', category: 'Carpenter', status: 'closed', description: 'Install and align soft-close hinges on kitchen cabinets.', offersCount: 8, professional: 'Mary John' },
  ],
  spots: [
    {
      id: 's1',
      title: 'Food Court',
      category: 'Restaurant',
      image: 'https://picsum.photos/id/1040/600/400',
      rating: 4.2,
      deliveryTime: '12-25 mins',
      isFavorite: false,
      deliveryFee: 1200,
      promoBadge: 'Free delivery above ₦ 7,500',
    },
    {
      id: 's2',
      title: 'Food Court',
      category: 'Restaurant',
      image: 'https://picsum.photos/id/1060/600/400',
      rating: 4.2,
      deliveryTime: '12-25 mins',
      isFavorite: true,
      deliveryFee: 1600,
      promoBadge: null,
    },
    {
      id: 's3',
      title: 'Food Court',
      category: 'Restaurant',
      image: 'https://picsum.photos/id/1080/600/400',
      rating: 4.2,
      deliveryTime: '12-25 mins',
      isFavorite: false,
      deliveryFee: 1000,
      promoBadge: null,
    },
  ],
  professionals: [
    { id: 'pr1', name: 'Johnson Smith', category: 'Plumber', location: 'Sagamu', distanceKm: 13 },
    { id: 'pr2', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 },
    { id: 'pr3', name: 'Ade Bola', category: 'Carpenter', location: 'Sagamu', distanceKm: 10 },
  ],
  savedProfessionalIds: [],
  toggleSaveProfessional: (id) => set((s) => (
    s.savedProfessionalIds.includes(id)
      ? { savedProfessionalIds: s.savedProfessionalIds.filter((x) => x !== id) }
      : { savedProfessionalIds: [...s.savedProfessionalIds, id] }
  )),
  toggleSpotFavorite: (id) => set((s) => ({
    spots: s.spots.map((sp) => (sp.id === id ? { ...sp, isFavorite: !sp.isFavorite } : sp)),
  })),
}));