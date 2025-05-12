import { SafeAreaView } from "react-native-safe-area-context";
import { Text, StyleSheet } from "react-native";
import React from "react";



export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🏋️ Screen Training history</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
});