import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RootDrawerParamList } from '../navigation/RootNavigator';
import { useMessagesStore } from '../state/messagesStore';

export default function ChatDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const threadId = useMessagesStore((s) => s.selectedThreadId) ?? 't1';
  const thread = useMessagesStore((s) => s.threads.find((t) => t.id === threadId));
  const messages = useMessagesStore((s) => s.messages);
  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const markRead = useMessagesStore((s) => s.markThreadRead);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [text, setText] = React.useState('');

  const filteredMessages = React.useMemo(
    () => messages.filter((m) => m.threadId === threadId),
    [messages, threadId]
  );

  React.useEffect(() => {
    if (thread && thread.unreadCount > 0) markRead(thread.id);
  }, [thread?.id, thread?.unreadCount]);

  const renderItem = ({ item }: any) => {
    const isUser = item.sender === 'user';
    const bubbleVariant: ViewStyle = isUser
      ? { alignSelf: 'flex-end', backgroundColor: '#007AFF' }
      : { alignSelf: 'flex-start', backgroundColor: '#F2F2F7' };
    const bubbleStyle = [styles.bubble, bubbleVariant];
    const textStyle = { color: isUser ? '#fff' : theme.colors.textPrimary };
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View style={{ marginHorizontal: 12, marginVertical: 6 }}>
        <View style={bubbleStyle}>
          <Text style={[styles.bubbleText, textStyle]}>{item.text}</Text>
        </View>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, alignSelf: isUser ? 'flex-end' : 'flex-start' }}>{time}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.chatHeader, { paddingHorizontal: 16, paddingVertical: 12 }]}> 
        <Pressable onPress={() => navigation.navigate('Messages')} accessibilityLabel="Back" style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{thread?.partnerName ?? 'Chat'}</Text>
          {!!thread?.subtitle && <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{thread.subtitle}</Text>}
        </View>
        <Pressable onPress={() => setMenuOpen((v) => !v)} accessibilityLabel="Menu" style={{ padding: 8 }}>
          <Feather name="more-horizontal" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
      {menuOpen && (
        <View style={{ position: 'absolute', right: 16, top: 48, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 8, gap: 8 }}>
          <Pressable style={{ padding: 8 }}><Text style={{ color: theme.colors.textPrimary }}>Mute</Text></Pressable>
          <Pressable style={{ padding: 8 }}><Text style={{ color: theme.colors.textPrimary }}>Delete</Text></Pressable>
        </View>
      )}
      <FlatList
        data={filteredMessages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
      <View style={[styles.inputBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
        <TextInput
          placeholder="Message"
          placeholderTextColor={theme.colors.textSecondary}
          value={text}
          onChangeText={setText}
          style={[styles.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.background }]}
        />
        <Pressable
          accessibilityLabel="Send"
          disabled={!text.trim()}
          onPress={() => { const v = text.trim(); if (!v) return; sendMessage(threadId, v); setText(''); }}
          style={[styles.sendBtn, { opacity: text.trim() ? 1 : 0.5 }]}
        >
          <Feather name="send" size={18} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatHeader: { flexDirection: 'row', alignItems: 'center' },
  bubble: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, maxWidth: '86%' },
  bubbleText: { fontSize: 14 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { padding: 8 },
});