import { create } from 'zustand';

export type Message = {
  id: string;
  threadId: string;
  sender: 'user' | 'partner';
  text: string;
  timestamp: string;
};

export type MessageThread = {
  id: string;
  partnerName: string;
  partnerType: 'bot' | 'store' | 'person';
  subtitle?: string;
  avatar?: string;
  unreadCount: number;
};

export type MessagesState = {
  threads: MessageThread[];
  messages: Message[];
  selectedThreadId?: string;
  setSelectedThreadId: (id: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
};

export const useMessagesStore = create<MessagesState>((set) => ({
  threads: [
    { id: 't1', partnerName: 'Padi', partnerType: 'bot', subtitle: 'ErrandSort ChatBot', unreadCount: 1 },
    { id: 't2', partnerName: 'Food Court', partnerType: 'store', subtitle: 'Restaurant', unreadCount: 0 },
    { id: 't3', partnerName: 'Johnson Richard', partnerType: 'person', subtitle: 'Courier', unreadCount: 0 },
    { id: 't4', partnerName: 'Peter Terfa', partnerType: 'person', subtitle: 'Plumber', unreadCount: 0 },
  ],
  messages: [
    { id: 'm1', threadId: 't1', sender: 'user', text: 'Hi, I need to order some groceries', timestamp: '2025-11-26T21:00:00Z' },
    { id: 'm2', threadId: 't1', sender: 'partner', text: "Hello! I'd be happy to help you with your grocery order today.", timestamp: '2025-11-26T21:02:00Z' },
    { id: 'm3', threadId: 't1', sender: 'user', text: 'Help me look for stores that are close to me and have high ratings', timestamp: '2025-11-26T21:05:00Z' },
    { id: 'm4', threadId: 't2', sender: 'user', text: 'Hello', timestamp: '2025-11-26T21:00:00Z' },
    { id: 'm5', threadId: 't2', sender: 'user', text: 'Are you open now?', timestamp: '2025-11-26T21:03:00Z' },
    { id: 'm6', threadId: 't2', sender: 'partner', text: "Yes, we're open! Welcome to FoodCourt.", timestamp: '2025-11-26T21:05:00Z' },
    { id: 'm7', threadId: 't2', sender: 'user', text: "Would you be able to deliver to the Al-Hikmah university male hostel", timestamp: '2025-11-26T21:07:00Z' },
    { id: 'm8', threadId: 't3', sender: 'partner', text: 'I am on my way with your order', timestamp: '2025-11-26T21:07:00Z' },
    { id: 'm9', threadId: 't4', sender: 'partner', text: 'I have gotten all your plumbing items', timestamp: '2025-11-26T21:07:00Z' },
  ],
  selectedThreadId: undefined,
  setSelectedThreadId: (id) => set({ selectedThreadId: id }),
  sendMessage: (threadId, text) => set((s) => ({
    ...s,
    messages: [...s.messages, { id: `m${Date.now()}`, threadId, sender: 'user', text, timestamp: new Date().toISOString() }],
    threads: s.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
  })),
  markThreadRead: (threadId) => set((s) => {
    const threads = s.threads.map((t) =>
      t.id === threadId ? { ...t, unreadCount: 0 } : t
    );
    return { ...s, threads };
  }),
}));