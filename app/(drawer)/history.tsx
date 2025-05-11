import { View, Text, StyleSheet } from "react-native";
import React from "react";


const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffTime === 0) return "Aujourd’hui";
  if (diffTime === 1) return "Hier";
  return `Il y a ${diffTime} jours`;
};

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Screen Training history</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
});