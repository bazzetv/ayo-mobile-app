// app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

function CustomDrawerContent(props) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("jwt");
      await AsyncStorage.removeItem("refreshToken");
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="🚪 Logout"
        onPress={handleLogout}
        labelStyle={{ color: 'red', fontWeight: 'bold' }}
      />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#121212",
        },
        drawerActiveTintColor: "#2563eb",
        drawerInactiveTintColor: "#bbb",
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}