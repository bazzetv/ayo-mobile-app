import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import { AnimatedFAB } from 'react-native-paper';
import HomeScreen from './home';
import TrainingScreen from './training';
import HistoryScreen from './history';
import { useRouter, usePathname } from 'expo-router';
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
    const router = useRouter(); // ✅ Utilisation de `useRouter()` pour la navigation

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("jwt"); 
            await AsyncStorage.removeItem("refreshToken");
            await AsyncStorage.setItem("wasLoggedOut", "true");
            router.replace("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    return (
        <DrawerContentScrollView {...props}>
            {/* ✅ Affichage des éléments du menu */}
            <DrawerItemList {...props} />

            {/* ✅ Ajout du bouton de déconnexion */}
            <DrawerItem
                label="Logout"
                onPress={handleLogout}
                labelStyle={{ color: "red", fontWeight: "bold" }}
            />
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();

    return (
        <View style={{ flex: 1 }}>
            <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                  backgroundColor: "#0a0a0a", // Fond sombre
                },
                headerTintColor: "#ffffff", // Texte et icônes blancs
                headerTitleStyle: {
                  fontWeight: "bold",
                },
                drawerStyle: {
                  backgroundColor: "#121212", // Fond du menu latéral aussi sombre
                },
                drawerActiveTintColor: "#2563eb", // Couleur bleue pour l’item sélectionné
                drawerInactiveTintColor: "#bbb", // Autres items en gris clair
              }}>
                <Drawer.Screen name="home" component={HomeScreen} options={{
                    title: "Training Plan",
                    headerTitleStyle: { fontSize: 22, fontWeight: "bold" }
                }} />
                <Drawer.Screen name="training" component={TrainingScreen} options={{
                    title: "Training in progress",
                    headerTitleStyle: { fontWeight: "bold" }
                }} />
                <Drawer.Screen name="history" component={HistoryScreen}options={{ title: "Training history" }}
                />
            </Drawer.Navigator>
        </View>
    );
}
