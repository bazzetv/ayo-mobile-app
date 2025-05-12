import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Pressable } from 'react-native';

import HomeScreen from './home';
import TrainingScreen from './training';
import HistoryScreen from './history';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },

        // ✅ Affiche le bouton de menu drawer
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
        ),

        tabBarStyle: { backgroundColor: '#0a0a0a' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#888',
        animationEnabled: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'home') iconName = 'barbell';
          else if (route.name === 'training') iconName = 'fitness';
          else if (route.name === 'history') iconName = 'time';

          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="training" component={TrainingScreen} />
      <Tab.Screen name="history" component={HistoryScreen} />
    </Tab.Navigator>
  );
}