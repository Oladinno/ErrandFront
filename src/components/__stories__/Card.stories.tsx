import React from 'react';
import { ScrollView, View } from 'react-native';
import Card from '../Card';

export default { title: 'Card' } as unknown as any;

export const OrderCard = () => (
  <ScrollView horizontal style={{ padding: 16 }}>
    <Card variant="order" title="Jollof Rice" subtitle="FoodCourt" price={4500} image={'https://picsum.photos/id/1035/400/400'} rating={4.2} />
  </ScrollView>
);

export const SpotCard = () => (
  <ScrollView horizontal style={{ padding: 16 }}>
    <Card variant="spot" title="Food Court" subtitle="Restaurant" image={'https://picsum.photos/id/1040/600/400'} rating={4.2} deliveryTime={'12-25 mins'} deliveryFee={1200} promoBadge={'Free delivery above ₦ 7,500'} />
  </ScrollView>
);