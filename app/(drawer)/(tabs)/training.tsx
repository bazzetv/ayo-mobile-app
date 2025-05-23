import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TrainingScreen() {
  const [globalTimer, setGlobalTimer] = useState(0);
  const [restTimers, setRestTimers] = useState({});
  const [inputs, setInputs] = useState({});
  const [invalidFields, setInvalidFields] = useState({});
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  useEffect(() => {
    const interval = setInterval(() => setGlobalTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentTraining = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch("http://localhost:8080/private/training/current", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Aucun entraînement en cours");

      const data = await res.json();
      const programRes = await fetch(
        `http://localhost:8080/private/programs/${data.programId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!programRes.ok) throw new Error("Programme associé introuvable");

      const programData = await programRes.json();

      setTrainingData({
        program: programData.program,
        currentDay: data,
        progressId: data.progressId,
      });
    } catch (err) {
      console.error("Erreur fetchCurrentTraining:", err);
      setTrainingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTraining();
  }, []);

  const startRestTimer = (index, seconds) => {
    if (restTimers[index]) return;
    setRestTimers((prev) => ({ ...prev, [index]: seconds }));
    const interval = setInterval(() => {
      setRestTimers((prev) => {
        if (prev[index] <= 1) {
          clearInterval(interval);
          const updated = { ...prev };
          delete updated[index];
          return updated;
        }
        return { ...prev, [index]: prev[index] - 1 };
      });
    }, 1000);
  };

  const handleInputChange = (exerciseIndex, setIndex, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        [setIndex]: {
          ...((prev[exerciseIndex] || {})[setIndex] || {}),
          [field]: value,
        },
      },
    }));
  };

  const validateSet = async (exerciseIndex, setIndex) => {
    const { currentDay, program } = trainingData;

    const weight = inputs[exerciseIndex]?.[setIndex]?.weight
      ?? currentDay.exercises[exerciseIndex].sets[setIndex].weight;
    const reps = inputs[exerciseIndex]?.[setIndex]?.reps
      ?? currentDay.exercises[exerciseIndex].sets[setIndex].reps;

    console.log("Validating set:", { weight, reps });

    if (weight === undefined || weight === null || reps === undefined || reps === null) {
      setInvalidFields(prev => ({
        ...prev,
        [`${exerciseIndex}-${setIndex}`]: true,
      }));
      return;
    }

    setInvalidFields(prev => {
      const updated = { ...prev };
      delete updated[`${exerciseIndex}-${setIndex}`];
      return updated;
    });

    try {
      const token = await AsyncStorage.getItem("jwt");
      if (!token) return;

      const payload = {
        programId: program.id,
        currentTraining: {
          programId: program.id,
          weekIndex: currentDay.weekIndex,
          dayIndex: currentDay.dayIndex,
          name: currentDay.name,
          exercises: currentDay.exercises.map((exercise, i) => ({
            name: exercise.name,
            sets: exercise.sets.map((set, j) => {
              const key = `${i}-${j}`;
              return {
                weight: inputs[i]?.[j]?.weight ?? set.weight ?? null,
                reps: inputs[i]?.[j]?.reps ?? set.reps ?? null,
                finished: key === `${exerciseIndex}-${setIndex}` ? true : set.finished,
              };
            }),
          })),
        },
      };

      const res = await fetch("http://localhost:8080/private/training/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return;

      await fetchCurrentTraining();
    } catch (err) {
      console.error("Erreur API:", err);
    }
  };

  const finishTraining = async () => {
    const { progressId } = trainingData;
    try {
      const token = await AsyncStorage.getItem("jwt");
      await fetch("http://localhost:8080/private/training/finish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progressId }),
      });
    } catch (err) {
      console.error("Erreur finish:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Chargement…</Text>
      </View>
    );
  }

  if (!trainingData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Please start a training</Text>
      </View>
    );
  }

  const { currentDay, program } = trainingData;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{program.title || "Training"}</Text>
      <Text style={styles.subtitle}>
        Semaine {currentDay.weekIndex + 1} / {program.durationWeeks} — Jour {currentDay.dayIndex + 1}: {currentDay.name}
      </Text>
      <Text style={styles.globalTimer}>⏱️ {formatTime(globalTimer)}</Text>

      <FlatList
        data={currentDay.exercises || []}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <TouchableOpacity style={styles.videoButton}>
              <Text style={styles.videoText}>🎥 Voir la vidéo</Text>
            </TouchableOpacity>
            {item.sets.map((set, setIndex) => {
              const key = `${index}-${setIndex}`;
              const finished = set.finished;
              const isInvalid = invalidFields[key];
              return (
                <View
                  key={setIndex}
                  style={[
                    styles.setRow,
                    finished && !isInvalid && styles.finishedSet,
                  ]}
                >
                  <Text
                    style={[
                      styles.setLabel,
                      finished && !isInvalid && styles.finishedLabel,
                    ]}
                  >
                    Série {setIndex + 1}
                  </Text>
                  <View style={styles.inputGroup}>
                    <TextInput
                      placeholder="Poids (kg)"
                      placeholderTextColor="#888"
                      style={[
                        styles.input,
                        finished && !isInvalid && styles.finishedInput,
                        isInvalid && styles.inputError,
                      ]}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        handleInputChange(index, setIndex, "weight", text)
                      }
                      value={
                        inputs[index]?.[setIndex]?.weight !== undefined
                          ? inputs[index][setIndex].weight
                          : set.weight?.toString() || ""
                      }
                    />
                    <TextInput
                      placeholder="Répétitions"
                      placeholderTextColor="#888"
                      style={[
                        styles.input,
                        finished && !isInvalid && styles.finishedInput,
                        isInvalid && styles.inputError,
                      ]}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        handleInputChange(index, setIndex, "reps", text)
                      }
                      value={
                        inputs[index]?.[setIndex]?.reps !== undefined
                          ? inputs[index][setIndex].reps
                          : set.reps?.toString() || ""
                      }
                    />
                  </View>
                  <TouchableOpacity onPress={() => validateSet(index, setIndex)}>
                    <Text style={{ fontSize: 18, color: "#3b82f6" }}>✅
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity
              style={styles.restButton}
              onPress={() => startRestTimer(index, item.rest)}
            >
              <Text style={styles.restText}>
                {restTimers[index]
                  ? `Repos : ${restTimers[index]}s`
                  : `Démarrer repos (${item.rest}s)`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.finishButton} onPress={finishTraining}>
        <Text style={styles.finishText}>Finir l'entraînement</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 16, color: "#ccc", marginTop: 4 },
  globalTimer: { fontSize: 16, color: "#2ecc71", marginBottom: 20 },
  exerciseCard: { backgroundColor: "#1f1f1f", padding: 14, borderRadius: 10, marginBottom: 16 },
  exerciseName: { color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  videoButton: { backgroundColor: "#2563eb", padding: 6, borderRadius: 6, alignSelf: "flex-start", marginBottom: 6 },
  videoText: { color: "white" },
  setRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  setLabel: { color: "#ccc", width: 70 },
  inputGroup: { flex: 1, flexDirection: "row", gap: 8 },
  input: { backgroundColor: "#2a2a2a", padding: 8, borderRadius: 6, color: "#fff", flex: 1 },
  inputError: { borderColor: "#e74c3c", borderWidth: 1 },
  finishedSet: { backgroundColor: "#1e3a8a", borderRadius: 8, padding: 8 },
  finishedLabel: { color: "#fff" },
  finishedInput: { backgroundColor: "#3b82f6", color: "#fff" },
  restButton: { backgroundColor: "#444", padding: 10, borderRadius: 8, marginTop: 8 },
  restText: { color: "#fff", textAlign: "center" },
  finishButton: { backgroundColor: "#e74c3c", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 20 },
  finishText: { color: "white", fontWeight: "bold", fontSize: 16 },
});