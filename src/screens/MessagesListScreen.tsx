import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMessagesStore, MessageThread } from '../state/messagesStore';

export default function MessagesListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const threads = useMessagesStore((s) => s.threads);
  const messages = useMessagesStore((s) => s.messages);
  const setSelected = useMessagesStore((s) => s.setSelectedThreadId);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'store' | 'person'>('all');

  const handleBack = React.useCallback(() => {
    const parent = navigation.getParent?.();
    if (parent?.navigate) {
      parent.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } });
      return;
    }
    try {
      navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } });
    } catch {
      if (navigation.canGoBack?.()) navigation.goBack();
    }
  }, [navigation]);

  const filteredThreads = threads.filter((t) => {
    const byType = filter === 'all' ? true : filter === 'store' ? t.partnerType === 'store' : t.partnerType === 'person';
    const last = messages.filter((m) => m.threadId === t.id).slice(-1)[0];
    const preview = last?.text ?? '';
    const q = query.trim().toLowerCase();
    const byText = !q || t.partnerName.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
    return byType && byText;
  });

  const countAll = threads.length;
  const countStores = threads.filter((t) => t.partnerType === 'store').length;
  const countPeople = threads.filter((t) => t.partnerType === 'person').length;

  const renderThread = ({ item }: { item: MessageThread }) => {
    const last = messages.filter((m) => m.threadId === item.id).slice(-1)[0];
    const timestamp = new Date(last?.timestamp ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const initials = item.partnerName.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
    return (
      <Pressable
        onPress={() => { setSelected(item.id); navigation.navigate('Chat Detail'); }}
        style={[styles.card, { borderColor: theme.colors.border }]}
        accessibilityLabel={`Open chat with ${item.partnerName}`}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }]}> 
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{initials}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{item.partnerName}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{timestamp}</Text>
          </View>
          <Text numberOfLines={1} style={{ color: theme.colors.textSecondary }}>{last?.text ?? ''}</Text>
        </View>
        {item.unreadCount > 0 && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1DAA6B' }} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.header, { paddingHorizontal: 16, paddingVertical: 12 }]}> 
        <Pressable onPress={handleBack} accessibilityLabel="Back" style={{ padding: 8 }}>
          <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Messages</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => navigation.navigate('Cart')} accessibilityLabel="Cart" style={{ padding: 8 }}>
            <MaterialCommunityIcons name="cart-outline" size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => {}} accessibilityLabel="Notifications" style={{ padding: 8 }}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </View>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={[styles.search, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
          <Ionicons name="search" size={18} color={theme.colors.icon} />
          <TextInput placeholder="Search messages..." placeholderTextColor={theme.colors.textSecondary} value={query} onChangeText={setQuery} style={{ flex: 1, color: theme.colors.textPrimary }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setFilter('all')} style={[styles.filter, { borderColor: theme.colors.border, backgroundColor: filter === 'all' ? theme.colors.card : 'transparent' }]}> 
            <Text style={{ color: theme.colors.textPrimary }}>All ({countAll})</Text>
          </Pressable>
          <Pressable onPress={() => setFilter('store')} style={[styles.filter, { borderColor: theme.colors.border, backgroundColor: filter === 'store' ? theme.colors.card : 'transparent' }]}> 
            <Text style={{ color: theme.colors.textPrimary }}>Stores ({countStores})</Text>
          </Pressable>
          <Pressable onPress={() => setFilter('person')} style={[styles.filter, { borderColor: theme.colors.border, backgroundColor: filter === 'person' ? theme.colors.card : 'transparent' }]}> 
            <Text style={{ color: theme.colors.textPrimary }}>People ({countPeople})</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={filteredThreads}
        keyExtractor={(t) => t.id}
        renderItem={renderThread}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 72 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  filter: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingRight: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
});