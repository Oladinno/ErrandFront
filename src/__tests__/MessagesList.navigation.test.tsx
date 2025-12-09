import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessagesListScreen from '../../src/screens/MessagesListScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const __navMock = { navigate: jest.fn(), parentNavigate: jest.fn() };
  return { ...actual, useNavigation: () => ({ navigate: __navMock.navigate, getParent: () => ({ navigate: __navMock.parentNavigate }) }), __navMock };
});

jest.mock('../../src/state/messagesStore', () => {
  const __storeMocks = { setSelectedThreadId: jest.fn() };
  const useMessagesStore = (sel: any) => sel({
    threads: [
      { id: 't1', partnerName: 'Padi', partnerType: 'bot', subtitle: 'ErrandSort ChatBot', unreadCount: 1 },
      { id: 't2', partnerName: 'Mary John', partnerType: 'person', subtitle: '', unreadCount: 0 },
    ],
    messages: [
      { id: 'm1', threadId: 't1', sender: 'partner', text: 'Hello!', timestamp: new Date().toISOString() },
      { id: 'm2', threadId: 't1', sender: 'user', text: 'Hi there', timestamp: new Date().toISOString() },
      { id: 'm3', threadId: 't2', sender: 'partner', text: 'Ping', timestamp: new Date().toISOString() },
    ],
    setSelectedThreadId: __storeMocks.setSelectedThreadId,
  });
  return { useMessagesStore, __storeMocks };
});

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { const e: any = console.error; e.mockRestore?.(); });

describe('MessagesListScreen navigation and filters', () => {
  test('Back navigates to Home', () => {
    const { getByLabelText } = render(<MessagesListScreen />);
    fireEvent.press(getByLabelText('Back'));
    const { __navMock } = require('@react-navigation/native');
    expect(__navMock.parentNavigate).toHaveBeenCalledWith('App', { screen: 'Tabs', params: { screen: 'Home' } });
  });

  test('Open chat navigates to Chat Detail and selects thread', () => {
    const { getByLabelText } = render(<MessagesListScreen />);
    fireEvent.press(getByLabelText('Open chat with Padi'));
    const { __navMock } = require('@react-navigation/native');
    const { __storeMocks } = require('../../src/state/messagesStore');
    expect(__navMock.navigate).toHaveBeenCalledWith('Chat Detail');
    expect(__storeMocks.setSelectedThreadId).toHaveBeenCalledWith('t1');
  });

  test('Filters adjust list', () => {
    const { getByText } = render(<MessagesListScreen />);
    fireEvent.press(getByText(/Stores/));
    fireEvent.press(getByText(/People/));
    fireEvent.press(getByText(/All/));
  });
});

