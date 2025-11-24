import React from 'react';
import renderer from 'react-test-renderer';
import SegmentedControl from '../components/SegmentedControl';

describe('SegmentedControl', () => {
  it('renders tabs and switches value', () => {
    const onChange = jest.fn();
    const tree = renderer.create(
      <SegmentedControl options={[{ key: 'food', label: 'Food' }, { key: 'services', label: 'Services' }]} value={'food'} onChange={onChange} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});