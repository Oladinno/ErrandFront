import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import ProviderProfileScreen from '../../src/screens/ProviderProfileScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { parentNavigate: jest.fn(), navigate: jest.fn(), goBack: jest.fn() };
  return { ...actual, useNavigation: () => ({ getParent: () => ({ navigate: __navMock.parentNavigate }), navigate: __navMock.navigate, goBack: __navMock.goBack }), useRoute: () => ({ params: { providerId: 'pr2' } }), __navMock };
});

jest.mock('react-native-safe-area-context', () => {
  const SafeAreaView = ({ children }: any) => children;
  const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
  return { SafeAreaView, useSafeAreaInsets };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({
    cart: [],
    professionals: [
      { id: 'pr1', name: 'Johnson Smith', category: 'Plumber', location: 'Sagamu', distanceKm: 13 },
      { id: 'pr2', name: 'Mary John', category: 'Electrician', location: 'Sagamu', distanceKm: 8 },
    ],
    jobs: [
      { id: 'j3', title: 'Install kitchen cabinet hinges', category: 'Carpenter', status: 'closed', description: 'Install and align soft-close hinges on kitchen cabinets.', offersCount: 8, professional: 'Mary John' },
    ],
    orders: [],
    spots: [],
    savedProfessionalIds: [],
    toggleSaveProfessional: jest.fn(),
  });
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('ProviderProfile navigation', () => {
  test('pressing ProCard navigates to ProviderProfile', () => {
    const { getByLabelText, getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Services'));
    const card = getByLabelText('Mary John');
    fireEvent.press(card);
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.parentNavigate).toHaveBeenCalledWith('App', { screen: 'ProviderProfile', params: { providerId: 'pr2' } });
  });

  test('ProviderProfile renders with name and sections', () => {
    const { getByText } = render(<ProviderProfileScreen />);
    expect(getByText('Mary John')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
    expect(getByText('What I Do')).toBeTruthy();
    expect(getByText('Past Jobs')).toBeTruthy();
  });
});
