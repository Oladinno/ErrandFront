import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Image, TextInput, Animated, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useAppStore } from '../state/store';

export type ItemCustomizationModalProps = {
  visible: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    image?: string;
    basePrice: number;
    rating: number;
    reviews: number;
    store?: string;
    customizations?: Array<{
      key: string;
      label: string;
      type: 'single' | 'multi';
      options: Array<{ key: string; label: string; extra?: number }>;
    }>;
  };
};

export default function ItemCustomizationModal({ visible, onClose, item }: ItemCustomizationModalProps) {
  const theme = useTheme();
  const addToCart = useAppStore((s) => s.addToCart);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const spots = useAppStore((s) => s.spots);
  const spot = spots.find((sp) => sp.title === (item?.store ?? '')) ?? spots[0];
  const [favorited, setFavorited] = React.useState<boolean>(spot?.isFavorite ?? false);
  const [qty, setQty] = React.useState<number>(1);
  const [notes, setNotes] = React.useState<string>('');
  const [currentTotalPrice, setCurrentTotalPrice] = React.useState<number>(item.basePrice);
  const [selected, setSelected] = React.useState<Record<string, string | string[]>>({});
  const translate = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) Animated.timing(translate, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    else Animated.timing(translate, { toValue: Dimensions.get('window').height, duration: 200, useNativeDriver: true }).start();
  }, [visible]);

  React.useEffect(() => {
    const groups = item.customizations ?? [];
    const extra = groups.reduce((sum, g) => {
      const sel = selected[g.key];
      if (!sel) return sum;
      if (g.type === 'single') {
        const opt = g.options.find((o) => o.key === sel);
        return sum + (opt?.extra ?? 0);
      }
      const arr = Array.isArray(sel) ? sel : [];
      return sum + arr.reduce((s, k) => s + (g.options.find((o) => o.key === k)?.extra ?? 0), 0);
    }, 0);
    setCurrentTotalPrice(item.basePrice + extra);
  }, [item.basePrice, item.customizations, selected]);

  const onToggleFav = () => {
    setFavorited((v) => !v);
    if (spot) toggleSpotFavorite(spot.id);
  };

  const onAdd = () => {
    const final = currentTotalPrice * qty;
    const newId = `${item.id}-cust-${Date.now()}`;
    const chickenStyleSel = typeof selected['chickenStyle'] === 'string' ? (selected['chickenStyle'] as string) : undefined;
    const sidesSel = Array.isArray(selected['sides']) ? (selected['sides'] as string[]) : [];
    addToCart({
      id: newId,
      name: item.name,
      price: currentTotalPrice,
      image: item.image,
      store: item.store ?? spot?.title,
      rating: item.rating,
      reviews: item.reviews,
      qty,
      customizations: { chickenStyle: chickenStyleSel, sides: sidesSel },
      notes,
    });
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.sheet, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, transform: [{ translateY: translate }] }]}> 
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}> 
            <Pressable onPress={onClose} accessibilityLabel="Back" style={styles.iconBtn}> 
              <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Item</Text>
            <Pressable onPress={onClose} accessibilityLabel="Close" style={styles.iconBtn}> 
              <Feather name="x" size={20} color={theme.colors.textPrimary} />
            </Pressable>
          </View>

          <View style={{ padding: 16 }}>
            <View style={styles.bannerWrap}>
              <Image source={{ uri: item.image ?? 'https://picsum.photos/id/1040/600/400' }} style={styles.banner} />
            </View>

            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>₦{item.basePrice.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <FontAwesome name="star" size={12} color="#F59E0B" />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.rating.toFixed(1)} ({item.reviews} Reviews)</Text>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 6 }}>Contains 1 pack of Jollof rice and chicken. Customization options available</Text>
            </View>

            {(item.customizations ?? [
              { key: 'chickenStyle', label: 'Chicken Style', type: 'single', options: [
                { key: 'plain', label: 'Plain Fried', extra: 0 },
                { key: 'deep', label: 'Deep Fried', extra: 0 },
                { key: 'rotiserri', label: 'Rotiserri-ed + ₦500', extra: 500 },
              ] },
              { key: 'sides', label: 'Sides', type: 'multi', options: [
                { key: 'coleslaw', label: 'Coleslaw + ₦700', extra: 700 },
                { key: 'plantain', label: 'Plantain + ₦900', extra: 900 },
              ] },
            ]).map((group) => (
              <View key={group.key} style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{group.label}</Text>
                  <View style={[styles.badge, { borderColor: theme.colors.border }]}>
                    <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', fontSize: 12 }}>Optional</Text>
                  </View>
                </View>
                {group.options.map((opt) => {
                  const sel = selected[group.key];
                  const active = group.type === 'single' ? sel === opt.key : Array.isArray(sel) ? (sel as string[]).includes(opt.key) : false;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => {
                        setSelected((s) => {
                          const curr = s[group.key];
                          if (group.type === 'single') return { ...s, [group.key]: opt.key };
                          const arr = Array.isArray(curr) ? (curr as string[]) : [];
                          const exists = arr.includes(opt.key);
                          const next = exists ? arr.filter((k) => k !== opt.key) : [...arr, opt.key];
                          return { ...s, [group.key]: next };
                        });
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
                    >
                      <Text style={{ color: theme.colors.textPrimary }}>{opt.label}</Text>
                      {group.type === 'single' ? (
                        <View style={[styles.radio, { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.accent : 'transparent' }]} />
                      ) : (
                        <View style={[styles.checkbox, { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.accent : 'transparent' }]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="edit-3" size={16} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary }}>Add notes for the restaurant (Optional)</Text>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes for the restaurant (Optional)"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.notes, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
                multiline
              />
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
            <View style={styles.qtyRow}>
              <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={[styles.qtyBtn, { borderColor: theme.colors.border }]}> 
                <Text style={{ color: theme.colors.textPrimary }}>-</Text>
              </Pressable>
              <Text style={{ color: theme.colors.textPrimary, minWidth: 24, textAlign: 'center' }}>{qty}</Text>
              <Pressable onPress={() => setQty((q) => q + 1)} style={[styles.qtyBtn, { borderColor: theme.colors.border }]}> 
                <Text style={{ color: theme.colors.textPrimary }}>+</Text>
              </Pressable>
            </View>
            <Pressable onPress={onAdd} style={[styles.addBtn, { backgroundColor: theme.colors.accent }]}> 
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add ₦{(currentTotalPrice * qty).toLocaleString()} to cart</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  iconBtn: { padding: 8, borderRadius: 16 },
  title: { fontSize: 16, fontWeight: '700' },
  bannerWrap: { position: 'relative' },
  banner: { width: '100%', height: 160, borderRadius: 12 },
  floatBtn: { position: 'absolute', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1 },
  notes: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  addBtn: { flex: 1, marginLeft: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
});
