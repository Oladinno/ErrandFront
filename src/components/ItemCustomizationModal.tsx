import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Image, TextInput, Animated, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useAppStore } from '../state/store';

export type ItemCustomizationModalProps = {
  visible: boolean;
  onClose: () => void;
  item: { id: string; name: string; image?: string; basePrice: number; rating: number; reviews: number; store?: string };
};

export default function ItemCustomizationModal({ visible, onClose, item }: ItemCustomizationModalProps) {
  const theme = useTheme();
  const addToCart = useAppStore((s) => s.addToCart);
  const toggleSpotFavorite = useAppStore((s) => s.toggleSpotFavorite);
  const spots = useAppStore((s) => s.spots);
  const spot = spots.find((sp) => sp.title === (item.store ?? '')) ?? spots[0];
  const [favorited, setFavorited] = React.useState<boolean>(spot?.isFavorite ?? false);
  const [qty, setQty] = React.useState<number>(1);
  const [notes, setNotes] = React.useState<string>('');
  const [chickenStyle, setChickenStyle] = React.useState<'plain' | 'deep' | 'rotiserri' | undefined>(undefined);
  const [sides, setSides] = React.useState<{ coleslaw: boolean; plantain: boolean }>({ coleslaw: false, plantain: false });
  const [currentTotalPrice, setCurrentTotalPrice] = React.useState<number>(item.basePrice);
  const translate = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) Animated.timing(translate, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    else Animated.timing(translate, { toValue: Dimensions.get('window').height, duration: 200, useNativeDriver: true }).start();
  }, [visible]);

  React.useEffect(() => {
    const extra = (chickenStyle === 'rotiserri' ? 500 : 0) + (sides.coleslaw ? 700 : 0) + (sides.plantain ? 900 : 0);
    setCurrentTotalPrice(item.basePrice + extra);
  }, [item.basePrice, chickenStyle, sides]);

  const onToggleFav = () => {
    setFavorited((v) => !v);
    if (spot) toggleSpotFavorite(spot.id);
  };

  const onAdd = () => {
    const final = currentTotalPrice * qty;
    const newId = `${item.id}-cust-${Date.now()}`;
    addToCart({
      id: newId,
      name: item.name,
      price: currentTotalPrice,
      image: item.image,
      store: item.store ?? spot?.title,
      rating: item.rating,
      reviews: item.reviews,
      qty,
      customizations: { chickenStyle, sides: Object.entries(sides).filter(([, v]) => v).map(([k]) => k) },
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
              <Pressable onPress={() => {}} accessibilityLabel="Search" style={[styles.floatBtn, { left: undefined, right: 60, top: 10, backgroundColor: theme.colors.card }]}> 
                <Ionicons name="search" size={18} color={theme.colors.textPrimary} />
              </Pressable>
              <Pressable onPress={onToggleFav} accessibilityLabel="Favorite" style={[styles.floatBtn, { right: 10, top: 10, backgroundColor: theme.colors.card }]}> 
                <MaterialCommunityIcons name={favorited ? 'heart' : 'heart-outline'} size={18} color={favorited ? theme.colors.danger : theme.colors.textPrimary} />
              </Pressable>
              <Pressable onPress={() => {}} accessibilityLabel="Options" style={[styles.floatBtn, { right: 10, top: 56, backgroundColor: theme.colors.card }]}> 
                <Feather name="more-horizontal" size={18} color={theme.colors.textPrimary} />
              </Pressable>
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

            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Chicken Style</Text>
                <View style={[styles.badge, { borderColor: theme.colors.border }]}>
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', fontSize: 12 }}>Optional</Text>
                </View>
              </View>
              {([
                { key: 'plain', label: 'Plain Fried', extra: 0 },
                { key: 'deep', label: 'Deep Fried', extra: 0 },
                { key: 'rotiserri', label: 'Rotiserri-ed + ₦500', extra: 500 },
              ] as const).map((opt) => {
                const active = chickenStyle === opt.key;
                return (
                  <Pressable key={opt.key} onPress={() => setChickenStyle(opt.key)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                    <Text style={{ color: theme.colors.textPrimary }}>{opt.label}</Text>
                    <View style={[styles.radio, { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.accent : 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Sides</Text>
                <View style={[styles.badge, { borderColor: theme.colors.border }]}>
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', fontSize: 12 }}>Optional</Text>
                </View>
              </View>
              {([
                { key: 'coleslaw', label: 'Coleslaw + ₦700', price: 700 },
                { key: 'plantain', label: 'Plantain + ₦900', price: 900 },
              ] as const).map((opt) => {
                const key = opt.key;
                const active = sides[key];
                return (
                  <Pressable key={key} onPress={() => setSides((s) => ({ ...s, [key]: !s[key] }))} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                    <Text style={{ color: theme.colors.textPrimary }}>{opt.label}</Text>
                    <View style={[styles.checkbox, { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.accent : 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>

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