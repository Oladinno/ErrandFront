import React from 'react';
import renderer from 'react-test-renderer';
import Card from '../components/Card';

describe('Card', () => {
  it('renders order variant with rating and add button', () => {
    const tree = renderer.create(
      <Card variant="order" title="Jollof Rice" subtitle="FoodCourt" price={4500} image={'https://picsum.photos/400'} rating={4.2} onAdd={() => {}} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
  it('renders spot variant with promo and metadata', () => {
    const tree = renderer.create(
      <Card variant="spot" title="Food Court" subtitle="Restaurant" image={'https://picsum.photos/600/400'} rating={4.2} deliveryTime={'12-25 mins'} deliveryFee={1200} promoBadge={'Free delivery above ₦ 7,500'} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});