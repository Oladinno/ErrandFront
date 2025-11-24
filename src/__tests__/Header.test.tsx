import React from 'react';
import renderer from 'react-test-renderer';
import Header from '../components/Header';

describe('Header', () => {
  it('renders location with ellipsis and icons', () => {
    const tree = renderer.create(<Header location="12, North Avenue, CP Street, Sagamu" />).toJSON();
    expect(tree).toBeTruthy();
  });
});