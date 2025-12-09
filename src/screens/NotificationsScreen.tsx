import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const [all, setAll] = React.useState(true);
  const [orderStatus, setOrderStatus] = React.useState(true);
  const [driverArrival, setDriverArrival] = React.useState(true);
  const [specialOffers, setSpecialOffers] = React.useState(true);
  const [newRestaurant, setNewRestaurant] = React.useState(false);
  const [featureUpdates, setFeatureUpdates] = React.useState(true);

  React.useEffect(() => {
    if (!all) {
      setOrderStatus(false);
      setDriverArrival(false);
      setSpecialOffers(false);
      setNewRestaurant(false);
      setFeatureUpdates(false);
    }
  }, [all]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}> 
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}> 
        <View style={styles.row}> 
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Receive All Notifications</Text>
          <Switch value={all} onValueChange={setAll} />
        </View>

        <View style={{ marginTop: 16 }}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Order Alerts</Text>
          <View style={styles.row}> 
            <Text style={{ color: theme.colors.textPrimary }}>Order Status Changes</Text>
            <Switch value={orderStatus} onValueChange={setOrderStatus} />
          </View>
          <View style={styles.row}> 
            <Text style={{ color: theme.colors.textPrimary }}>Driver Arrival</Text>
            <Switch value={driverArrival} onValueChange={setDriverArrival} />
          </View>
        </View>

        <View style={{ marginTop: 16 }}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Promotional Alerts</Text>
          <View style={styles.row}> 
            <Text style={{ color: theme.colors.textPrimary }}>Special Offers & Discounts</Text>
            <Switch value={specialOffers} onValueChange={setSpecialOffers} />
          </View>
          <View style={styles.row}> 
            <Text style={{ color: theme.colors.textPrimary }}>New Restaurant Alerts</Text>
            <Switch value={newRestaurant} onValueChange={setNewRestaurant} />
          </View>
        </View>

        <View style={{ marginTop: 16 }}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>App Updates</Text>
          <View style={styles.row}> 
            <Text style={{ color: theme.colors.textPrimary }}>App Feature Updates</Text>
            <Switch value={featureUpdates} onValueChange={setFeatureUpdates} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { textAlign: 'center', fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  title: { fontWeight: '600' },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
});
