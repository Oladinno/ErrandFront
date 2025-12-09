import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import ChatDetailScreen from '../../src/screens/ChatDetailScreen';
import { colors } from '../../src/theme/colors';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // @ts-ignore
  if (console.error && (console.error as any).mockRestore) (console.error as any).mockRestore();
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/store', () => {
  const useAppStore = (sel: any) => sel({ mode: 'dark' });
  return { useAppStore };
});

jest.mock('../../src/state/messagesStore', () => {
  const __storeMocks = { sendMessage: jest.fn(), markThreadRead: jest.fn(), setSelectedThreadId: jest.fn() };
  const useMessagesStore = (sel: any) => sel({
    threads: [{ id: 't1', partnerName: 'Padi', partnerType: 'bot', subtitle: 'ErrandSort ChatBot', unreadCount: 1 }],
    messages: [
      { id: 'm1', threadId: 't1', sender: 'partner', text: 'Hello!', timestamp: new Date().toISOString() },
      { id: 'm2', threadId: 't1', sender: 'user', text: 'Hi there', timestamp: new Date().toISOString() },
    ],
    selectedThreadId: 't1',
    sendMessage: __storeMocks.sendMessage,
    markThreadRead: __storeMocks.markThreadRead,
    setSelectedThreadId: __storeMocks.setSelectedThreadId,
  });
  return { useMessagesStore, __storeMocks };
});

describe('ChatDetailScreen dark mode', () => {
  test('renders partner and user bubbles and text is readable', () => {
    const { getByLabelText, getByText } = render(<ChatDetailScreen />);
    expect(getByLabelText('partner-bubble')).toBeTruthy();
    expect(getByLabelText('user-bubble')).toBeTruthy();
    const text = getByText('Hi there');
    expect(text).toHaveStyle({ color: '#fff' });
  });

  test('send button disabled when input empty and sends message when filled', () => {
    const { getByPlaceholderText, getByLabelText } = render(<ChatDetailScreen />);
    const input = getByPlaceholderText('Message');
    const send = getByLabelText('Send');
    fireEvent.press(send);
    const { __storeMocks } = require('../../src/state/messagesStore');
    expect(__storeMocks.sendMessage).not.toHaveBeenCalled();
    fireEvent.changeText(input, 'Test');
    fireEvent.press(send);
    expect(__storeMocks.sendMessage).toHaveBeenCalledWith('t1', 'Test');
  });

  test('marks thread as read when unreadCount > 0', () => {
    render(<ChatDetailScreen />);
    const { __storeMocks } = require('../../src/state/messagesStore');
    expect(__storeMocks.markThreadRead).toHaveBeenCalledWith('t1');
  });
});
