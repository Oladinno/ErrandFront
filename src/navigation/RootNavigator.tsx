import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, Pressable, useWindowDimensions, I18nManager } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SendPackageScreen from '../screens/SendPackageScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import SavedScreen from '../screens/SavedScreen';
import SupportScreen from '../screens/SupportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import StoreScreen from '../screens/StoreScreen';

export type AppStackParamList = { Tabs: undefined; Store: { storeId: string } };
export type RootDrawerParamList = {
  App: undefined;
  Cart: undefined;
  Checkout: undefined;
  Messages: undefined;
  'Send a Package': undefined;
  Promotions: undefined;
  Saved: undefined;
  Support: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();
type MessagesStackParamList = { 'Messages': undefined; 'Chat Detail': undefined };
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();

function Tabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.icon,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Explore') iconName = focused ? 'globe' : 'globe-outline';
          if (route.name === 'Activity') iconName = focused ? 'time' : 'time-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const theme = useTheme();
  const navTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  const { width } = useWindowDimensions();
  const isRTL = I18nManager.isRTL;
  const drawerWidth = Math.min(320, Math.round(width * 0.8));
  return (
    <NavigationContainer theme={navTheme}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          overlayColor: 'rgba(0,0,0,0.5)',
          swipeEnabled: true,
          drawerPosition: isRTL ? 'right' : 'left',
          drawerStyle: {
            width: drawerWidth,
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            ...(isRTL ? { marginLeft: 16 } : { marginRight: 16 }),
          },
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="App" component={App} />
        <Drawer.Screen name="Cart" component={CartScreen} />
        <Drawer.Screen name="Checkout" component={CheckoutScreen} />
        <Drawer.Screen name="Messages" component={MessagesFlow} />
        <Drawer.Screen name="Send a Package" component={SendPackageScreen} />
        <Drawer.Screen name="Promotions" component={PromotionsScreen} />
        <Drawer.Screen name="Saved" component={SavedScreen} />
        <Drawer.Screen name="Support" component={SupportScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AppStack.Screen name="Tabs" component={Tabs} />
      <AppStack.Screen name="Store" component={StoreScreen} />
    </AppStack.Navigator>
  );
}

function CustomDrawerContent({ navigation }: any) {
  const theme = useTheme();
  return (
    <DrawerContentScrollView contentContainerStyle={{ paddingVertical: 12 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>ErrandSort</Text>
        <Pressable accessibilityLabel="Close menu" onPress={() => navigation.closeDrawer()} style={{ padding: 8, borderRadius: 16 }}>
          <Feather name="x" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cart" onPress={() => { navigation.navigate('Cart'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <MaterialCommunityIcons name="cart-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Cart</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Send a Package" onPress={() => { navigation.navigate('Send a Package'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Feather name="send" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Send a Package</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Promotions" onPress={() => { navigation.navigate('Promotions'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Feather name="percent" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Promotions</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Saved" onPress={() => { navigation.navigate('Saved'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <MaterialCommunityIcons name="bookmark-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Saved</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => { navigation.closeDrawer(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Ionicons name="notifications-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Notifications</Text>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Support" onPress={() => { navigation.navigate('Support'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Feather name="headphones" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Support</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => { navigation.navigate('Settings'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Feather name="settings" size={18} color={theme.colors.textPrimary} />
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Settings</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

function MessagesFlow() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <MessagesStack.Screen name="Messages" component={MessagesListScreen} />
      <MessagesStack.Screen name="Chat Detail" component={ChatDetailScreen} />
    </MessagesStack.Navigator>
  );
}