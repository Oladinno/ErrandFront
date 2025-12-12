import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ProviderProfileScreen from '../../src/screens/ProviderProfileScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn(), goBack: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }), goBack: __navMock.goBack }), useRoute: () => ({ params: { providerId: 'pr1' } }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({
    professionals: [ { id: 'pr1', name: 'Johnson Smith', category: 'Plumber', location: 'Sagamu', distanceKm: 13 }, { id: 'pr2', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 } ],
    jobs: [ { id: 'j1', title: 'Fix Leaking Kitchen Sink and Replace Tap', category: 'Plumber', status: 'closed', description: 'Fix sink', offersCount: 8, professional: 'Johnson Smith' } ],
  });
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('ProviderProfileScreen data fetching', () => {
  test('renders availability, pricing, and profile data', async () => {
    const { getByText, queryByText } = render(<ProviderProfileScreen />);
    expect(getByText('Description')).toBeTruthy();
    await waitFor(() => expect(queryByText('Loading...')).toBeFalsy(), { timeout: 2000 });
    expect(getByText(/Pricing/)).toBeTruthy();
  });
});

