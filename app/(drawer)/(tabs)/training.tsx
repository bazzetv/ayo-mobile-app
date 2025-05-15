import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrainingScreen({ route }) {
  const { program: programString, progressId, selectedDayIndex = 0 } = route.params || {};
  let program;

  try {
    program = JSON.parse(programString);
  } catch (e) {
    console.error("Erreur de parsing du programme :", e);
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Programme invalide</Text>
      </View>
    );
  }

  const currentWeekIndex = program.currentWeek - 1;
  const currentDayData = program.structure?.[currentWeekIndex]?.days?.[selectedDayIndex];

  if (!currentDayData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Aucun exercice pour ce jour</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{program.title}</Text>
      <Text style={styles.subtitle}>
        Semaine {program.currentWeek} / {program.durationWeeks} — Jour {selectedDayIndex + 1}: {currentDayData.name}
      </Text>

      <FlatList
        data={currentDayData.exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseDetail}>Séries : {item.series}</Text>
            <Text style={styles.exerciseNote}>Notes : {item.notes}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 16, color: "#ccc", marginTop: 8, marginBottom: 20 },
  exerciseCard: {
    backgroundColor: "#1f1f1f",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  exerciseName: { color: "white", fontSize: 16, fontWeight: "bold" },
  exerciseDetail: { color: "#ccc", marginTop: 4 },
  exerciseNote: { color: "#999", marginTop: 2 },
});