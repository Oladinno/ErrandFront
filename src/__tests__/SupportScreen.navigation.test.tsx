import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SupportScreen from '../../src/screens/SupportScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({});
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('SupportScreen navigation', () => {
  test('Live Chat goes to Messages list', () => {
    const { getByLabelText } = render(<SupportScreen />);
    fireEvent.press(getByLabelText('Live Chat'));
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.navigate).toHaveBeenCalledWith('Messages');
  });
});

