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
  qty?: number;
  customizations?: { chickenStyle?: string; sides?: string[] };
  notes?: string;
};

export type Order = {
  id: string;
  status: 'ongoing' | 'past';
  items: Product[];
  total: number;
  eta?: string;
  tracking?: 'created' | 'preparing' | 'transit';
};

export type Job = {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'closed' | 'saved';
  professional?: string;
  description?: string;
  offersCount?: number;
  budget?: number;
  budgetType?: 'hourly' | 'fixed';
  location?: string;
  timeRequired?: string;
  attachments?: string[];
};

export type AppState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  cart: Product[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  hydrateCart: () => void;
  orders: Order[];
  addOrder: (o: Order) => void;
  placeOrderFromCart: (eta: string) => string;
  setOrderTracking: (id: string, stage: NonNullable<Order['tracking']>) => void;
  hydrateOrders: () => void;
  jobs: Job[];
  addJob: (job: Job) => void;
  hydrateJobs: () => void;
  updateJobStatus: (id: string, status: Job['status']) => void;
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
  addToCart: (p) => set((s) => {
    const existing = s.cart.find((c) => c.id === p.id);
    const next = existing
      ? s.cart.map((c) => (c.id === p.id ? { ...c, qty: (c.qty ?? 1) + 1 } : c))
      : [...s.cart, { ...p, qty: p.qty ?? 1 }];
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.setItem('cart', JSON.stringify(next));
    } catch {}
    return { cart: next };
  }),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
  updateCartQty: (id, qty) => set((s) => {
    const next = s.cart
      .map((c) => (c.id === id ? { ...c, qty } : c))
      .filter((c) => (c.qty ?? 1) > 0);
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.setItem('cart', JSON.stringify(next));
    } catch {}
    return { cart: next };
  }),
  clearCart: () => set(() => {
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.removeItem('cart');
    } catch {}
    return { cart: [] };
  }),
  hydrateCart: () => set((s) => {
    try {
      // @ts-ignore
      if (globalThis?.localStorage) {
        const raw = globalThis.localStorage.getItem('cart');
        if (raw) return { cart: JSON.parse(raw) };
      }
    } catch {}
    return { cart: s.cart };
  }),
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
      tracking: 'preparing',
    },
    {
      id: 'o2',
      status: 'past',
      items: [{ id: 'p3', name: 'Chips', price: 1300, store: 'FoodCourt', rating: 4.1, reviews: 8 }],
      total: 1300,
      eta: '12 mins',
      tracking: 'transit',
    },
  ],
  addOrder: (o) => set((s) => {
    const next = [o, ...s.orders];
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.setItem('orders', JSON.stringify(next));
    } catch {}
    return { orders: next };
  }),
  placeOrderFromCart: (eta) => {
    let newId = '';
    set((s) => {
      const id = `o${Date.now()}`;
      newId = id;
      const items = s.cart.map((c) => ({ ...c }));
      const total = items.reduce((sum, i) => sum + i.price * (i.qty ?? 1), 0);
      const order: Order = { id, status: 'ongoing', items, total, eta, tracking: 'created' };
      const next = [order, ...s.orders];
      try {
        // @ts-ignore
        if (globalThis?.localStorage) {
          globalThis.localStorage.setItem('orders', JSON.stringify(next));
          globalThis.localStorage.removeItem('cart');
        }
      } catch {}
      return { orders: next, cart: [] };
    });
    return newId;
  },
  setOrderTracking: (id, stage) => set((s) => {
    const next = s.orders.map((o) => (o.id === id ? { ...o, tracking: stage } : o));
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.setItem('orders', JSON.stringify(next));
    } catch {}
    return { orders: next };
  }),
  hydrateOrders: () => set((s) => {
    try {
      // @ts-ignore
      if (globalThis?.localStorage) {
        const raw = globalThis.localStorage.getItem('orders');
        if (raw) return { orders: JSON.parse(raw) };
      }
    } catch {}
    return { orders: s.orders };
  }),
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
  addJob: (job) => set((s) => {
    const next = [job, ...s.jobs];
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.setItem('jobs', JSON.stringify(next));
    } catch {}
    return { jobs: next };
  }),
  hydrateJobs: () => set((s) => {
    try {
      // @ts-ignore
      if (globalThis?.localStorage) {
        const raw = globalThis.localStorage.getItem('jobs');
        if (raw) return { jobs: JSON.parse(raw) };
      }
    } catch {}
    return { jobs: s.jobs };
  }),
  updateJobStatus: (id, status) => set((s) => {
    const next = s.jobs.map((j) => (j.id === id ? { ...j, status } : j));
    try {
      // @ts-ignore
      if (globalThis?.localStorage) globalThis.localStorage.setItem('jobs', JSON.stringify(next));
    } catch {}
    return { jobs: next };
  }),
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