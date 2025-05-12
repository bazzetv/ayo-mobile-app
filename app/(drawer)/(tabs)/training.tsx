// app/(drawer)/training.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Exemple de structure des props
const mockProgram = {
  title: "Upper/Lower Hypertrophy",
  durationWeeks: 10,
  currentWeek: 1,
  currentDay: 1,
  structure: [
    {
      week: 1,
      days: [
        { name: "Chest + Triceps" },
        { name: "Back + Biceps" },
        { name: "Legs" },
        { name: "Rest" },
        { name: "Shoulders" },
        { name: "Cardio" },
        { name: "Rest" },
      ],
    },
  ],
  completedDays: [0], // Jour 1 déjà fait
};

export default function TrainingScreen() {
  const router = useRouter();
  const program = mockProgram;
  const currentWeekIndex = program.currentWeek - 1;
  const days = program.structure[currentWeekIndex]?.days || [];
  const completed = program.completedDays || [];

  const handleDayPress = (index: number) => {
    if (index > program.currentDay) return;
    // TODO: router.push() vers l'écran de la journée
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{program.title}</Text>
      <Text style={styles.subtitle}>
        Semaine {program.currentWeek} / {program.durationWeeks}
      </Text>

      <FlatList
        data={days}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isCompleted = completed.includes(index);
          const isCurrent = index === program.currentDay;
          const isFuture = index > program.currentDay;

          let backgroundColor = "#2563eb";
          if (isCompleted) backgroundColor = "gray";
          else if (isCurrent) backgroundColor = "#2ecc71";
          else if (isFuture) backgroundColor = "#333";

          return (
            <TouchableOpacity
              style={[styles.dayCard, { backgroundColor }]}
              onPress={() => handleDayPress(index)}
              disabled={isFuture}
            >
              <Text style={styles.dayText}>
                Jour {index + 1}: {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 16, color: "#ccc", marginTop: 8, marginBottom: 20 },
  dayCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  dayText: {
    color: "white",
    fontSize: 16,
  },
});