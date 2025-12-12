export type RemoteStatus = 'CREATED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type OrderTrackResponse = {
  status: RemoteStatus;
  rider?: { name?: string; phone?: string; chatId?: string };
  orderId: string;
  eta?: string;
};

export type OrderItemInput = {
  id: string;
  name: string;
  price: number;
  qty: number;
  store?: string;
};

export type OrderCreateRequest = {
  clientOrderId?: string;
  items: OrderItemInput[];
  deliveryMethod: 'Delivery' | 'Pickup';
  etaPreference?: string;
};

export type OrderCreateResponse = {
  order: {
    id: string;
    status: 'ongoing' | 'past';
    items: OrderItemInput[];
    total: number;
    eta?: string;
    tracking?: 'created' | 'preparing' | 'transit';
  };
};

export type OrderResponse = {
  id: string;
  status: 'ongoing' | 'past';
  items: OrderItemInput[];
  total: number;
  eta?: string;
  tracking?: 'created' | 'preparing' | 'transit' | 'delivered';
};

export type ErrorResponse = {
  error: { code: string; message: string };
};

export type AvailabilityStatus = 'available' | 'busy' | 'offline';
export type AvailabilityResponse = {
  providerId: string;
  status: AvailabilityStatus;
  updatedAt: string;
  nextWindow?: string;
};

export type PricingVariation = { name: string; price: number; currency: string };
export type PricingResponse = {
  providerId: string;
  basePrice: number;
  currency: string;
  variations: PricingVariation[];
  surgeMultiplier?: number;
  discountPercent?: number;
  updatedAt: string;
};

export type PastJob = {
  id: string;
  title: string;
  clientName: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  technologies: string[];
  outcome: string;
  rating?: number;
  ratingCount?: number;
};

export type ProfessionalProfile = {
  id: string;
  name: string;
  category: string;
  location: string;
  distanceKm?: number;
  image?: string;
  description: string;
  whatIDoSummary: string;
  pastJobs: PastJob[];
};
