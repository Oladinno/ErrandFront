import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SendPackageScreen from '../../src/screens/SendPackageScreen';
import { Alert } from 'react-native';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({});
  return { useAppStore };
});

beforeAll(() => { jest.spyOn(Alert, 'alert').mockImplementation(() => undefined); jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('SendPackageScreen flow', () => {
  test('size selection and validation error', () => {
    const { getByLabelText, getByText } = render(<SendPackageScreen />);
    fireEvent.press(getByLabelText('medium'));
    fireEvent.press(getByText('Continue to Pricing'));
  });

  test('fills form and navigates to Checkout with draft params', () => {
    const { getAllByPlaceholderText, getByPlaceholderText, getByLabelText } = render(<SendPackageScreen />);
    fireEvent.changeText(getAllByPlaceholderText('Address')[0], 'A');
    fireEvent.changeText(getByPlaceholderText('Contact Name'), 'B');
    fireEvent.changeText(getByPlaceholderText('Contact Phone'), '09000000000');
    fireEvent.changeText(getAllByPlaceholderText('Address')[1], 'C');
    fireEvent.changeText(getByPlaceholderText('Recipient Name'), 'D');
    fireEvent.changeText(getByPlaceholderText('Recipient Phone'), '09000000001');
    fireEvent.changeText(getByPlaceholderText('Description'), 'E');
    fireEvent.press(getByLabelText('Continue to Pricing'));
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.navigate).toHaveBeenCalledWith('Checkout', expect.objectContaining({ draft: expect.any(Object) }));
  });
});
