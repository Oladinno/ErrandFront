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
