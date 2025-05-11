import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_URL = "http://localhost:8080";
const Logo = require("../../assets/images/logo.png");

const backgroundImages = [
  require("../../assets/images/background/issam1.webp"),
  require("../../assets/images/background/issam2.webp"),
  require("../../assets/images/background/issam3.webp"),
  require("../../assets/images/background/issam1.webp"),
];

export default function Login() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const nextImageAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    (async () => {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(available);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Erreur de récupération du JWT :", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(nextImageAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        nextImageAnim.setValue(0);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: "ayo", preferLocalhost: false });
      const authUrl = `${SERVER_URL}/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success") {
        const params = new URLSearchParams(result.url.split("?")[1]);
        const jwt = params.get("token");
        const refreshToken = params.get("refreshToken");

        if (jwt && refreshToken) {
          await AsyncStorage.setItem("jwt", jwt);
          await AsyncStorage.setItem("refreshToken", refreshToken);
          setIsLoggedIn(true);
          router.replace("/home");
        } else {
          Alert.alert("Erreur : Tokens non reçus.");
        }
      }
    } catch (error) {
      console.error("Erreur d'authentification :", error);
      Alert.alert("Erreur lors de la connexion.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const response = await fetch(`${SERVER_URL}/auth/apple-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appleId: credential.user,
          identityToken: credential.identityToken,
          email: credential.email,
          fullName: credential.fullName
            ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
            : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("jwt", data.token);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        setIsLoggedIn(true);
        router.replace("/home");
      } else {
        Alert.alert("Erreur : Impossible de se connecter avec Apple.");
      }
    } catch (error) {
      console.error("Erreur Apple :", error);
      Alert.alert("Erreur lors de la connexion avec Apple.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Image
        source={backgroundImages[(currentImageIndex + backgroundImages.length - 1) % backgroundImages.length]}
        style={[styles.backgroundImage, { opacity: 1 }]}
        resizeMode="cover"
      />

      <Animated.Image
        source={backgroundImages[currentImageIndex]}
        style={[styles.backgroundImage, { opacity: nextImageAnim }]}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        <View style={styles.card}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>
            Welcome In <Text style={{ color: "#2563eb" }}>AYO</Text> Training App
          </Text>

          <Text style={styles.baseline}>
            <Text style={{ color: "#2563eb", fontWeight: "bold" }}>A</Text>chieve 
            <Text style={{ color: "#2563eb", fontWeight: "bold" }}> Y</Text>our 
            <Text style={{ color: "#2563eb", fontWeight: "bold" }}> O</Text>bjectives
          </Text>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <AntDesign name="google" size={24} color="black" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          {isAppleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={8}
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: "90%",
    maxWidth: 350,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: "center",
  },
  logo: { width: 80, height: 80, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  baseline: { fontSize: 16, marginTop: 16, textAlign: "center", fontWeight: "500" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  googleButtonText: { fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  appleButton: { width: "100%", height: 50 },
});