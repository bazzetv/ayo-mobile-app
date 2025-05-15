import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";

const SERVER_URL = "http://localhost:8080/private/programs";
const { width } = Dimensions.get("window");

const fallbackPrograms = {
  started: [],
  not_started: [],
  finished: [],
};

const pages = ["🔥 In progress", "🚀 To discover", "✅ Done"];

type HomeScreenProps = {
  navigation: NavigationProp<any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState({ started: [], not_started: [], finished: [] });
  const scrollX = useRef(new Animated.Value(0)).current;
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"started" | "not_started" | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        const response = await fetch(SERVER_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des programmes");

        const { started = [], finished = [], not_started = [] } = await response.json();

        setPrograms({
          started: started.length ? started : fallbackPrograms.started,
          not_started: not_started.length ? not_started : fallbackPrograms.not_started,
          finished: finished.length ? finished : fallbackPrograms.finished,
        });
      } catch (err) {
        console.error("Erreur fetch:", err);
        setPrograms(fallbackPrograms);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleProgramPress = async (programId, status) => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch(`${SERVER_URL}/${programId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Échec de chargement du programme");

      const data = await res.json();
      setSelectedProgram({
        ...data.program,
        status: data.status,
        currentWeek: data.currentWeek,
        currentDay: data.currentDay,
        completedDays: data.completedDays,
      });
      setModalMode(status === "started" ? "started" : "not_started");
      setShowModal(true);
    } catch (err) {
      console.error("Erreur lors du chargement du programme :", err);
    }
  };

  const renderCard = (item, status) => (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleProgramPress(item.id, status)}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        {item.progress && <Text style={styles.progressText}>{item.progress}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderPage = (title, data, index) => {
    const status = index === 0 ? "started" : index === 1 ? "not_started" : "finished";
    return (
      <View style={styles.page}>
        <Text style={styles.pageTitle}>{title}</Text>
        {data.map((item) => renderCard(item, status))}
      </View>
    );
  };

  const renderPreviewModal = () => {
    if (!selectedProgram) return null;
    return (
      <>
        <Text style={styles.modalTitle}>{selectedProgram.title}</Text>
        <Text style={styles.modalSubtitle}>{selectedProgram.description}</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.modalLine}>📆 Durée : {selectedProgram.durationWeeks} semaines</Text>
          <Text style={styles.modalLine}>🧑‍🏫 Coach : {selectedProgram.coachName}</Text>
          <Text style={styles.modalLine}>📌 Statut : Pas encore démarré</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {selectedProgram.tags?.map((tag, i) => (
              <View key={i} style={{ backgroundColor: '#2563eb', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 }}>
                <Text style={{ color: '#fff', fontSize: 12 }}>{tag}</Text>
              </View>
            ))}
          </View>

          {selectedProgram.structure?.[0]?.days && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.modalLine}>📅 Jours (semaine 1) :</Text>
              {selectedProgram.structure[0].days.map((day, index) => (
                <Text key={index} style={styles.modalLine}>- Jour {index + 1} : {day.name}</Text>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem("jwt");
              const res = await fetch(`http://localhost:8080/private/programs/start`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ programId: selectedProgram.id }),
              });

              if (!res.ok) throw new Error("Erreur lors du démarrage");

              const { completedDays = {}, progressId } = await res.json();
              setShowModal(false);
              navigation.navigate("training", {
                program: JSON.stringify({ ...selectedProgram, completedDays }),
                progressId,
              });
            } catch (err) {
              console.error("Erreur démarrage :", err);
            }
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Démarrer le programme</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderDayModal = () => {
    if (!selectedProgram) return null;

    const currentWeekIndex = selectedProgram.currentWeek - 1;
    const days = selectedProgram.structure?.[currentWeekIndex]?.days || [];
    const completed = selectedProgram.completedDays?.[selectedProgram.currentWeek] || [];

    const currentDayIndex = completed.length === 0 ? 0 : selectedProgram.currentDay;

    return (
      <>
        <Text style={styles.modalTitle}>{selectedProgram.title}</Text>
        <Text style={styles.modalSubtitle}>
          Semaine {selectedProgram.currentWeek} / {selectedProgram.durationWeeks}
        </Text>
        {days.map((day, index) => {
          const isCompleted = completed.includes(index);
          const isCurrent = index === currentDayIndex;

          let backgroundColor = "#333";
          if (isCompleted) backgroundColor = "green";
          else if (isCurrent) backgroundColor = "#2563eb"; // bleu

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayCard, { backgroundColor }]}
              onPress={() => {
                navigation.navigate("training", {
                  program: JSON.stringify(selectedProgram),
                  progressId: selectedProgram.progressId,
                  selectedDayIndex: index,
                });
                setShowModal(false);
              }}
            >
              <Text style={styles.dayText}>Jour {index + 1}: {day.name}</Text>
            </TouchableOpacity>
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={[programs.started, programs.not_started, programs.finished]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setPageIndex(index);
        }}
        renderItem={({ item, index }) => renderPage(pages[index], item, index)}
      />
      <View style={styles.indicators}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.dot, i === pageIndex && styles.activeDot]} />
        ))}
      </View>

      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        onBackButtonPress={() => setShowModal(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        swipeDirection="down"
        onSwipeComplete={() => setShowModal(false)}
        useNativeDriver
        useNativeDriverForBackdrop
        hideModalContentWhileAnimating
        style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {modalMode === "started" && renderDayModal()}
            {modalMode === "not_started" && renderPreviewModal()}
            <View style={{ alignItems: 'center', marginTop: 30 }}>
              <View
                style={{
                  width: 40,
                  height: 5,
                  borderRadius: 10,
                  backgroundColor: '#666',
                  marginBottom: 10,
                }}
              />
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: '#ccc', fontSize: 16 }}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 40 },
  page: { width, padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#ffffff", marginBottom: 10 },
  card: { width: '48%', backgroundColor: "#1a1a1a", borderRadius: 12, margin: 5, shadowColor: "#2563eb", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, overflow: "hidden" },
  image: { width: "100%", height: 180 },
  cardTextContainer: { padding: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#ffffff" },
  cardDescription: { fontSize: 14, color: "#ccc", marginTop: 4 },
  progressText: { fontSize: 13, color: "#2563eb", marginTop: 6 },
  indicators: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#555", marginHorizontal: 4 },
  activeDot: { width: 16, backgroundColor: "#2563eb" },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#1a1a1a", padding: 20, borderRadius: 12, width: "85%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  modalSubtitle: { fontSize: 14, color: "#aaa", marginTop: 8, marginBottom: 16 },
  modalLine: { fontSize: 14, color: "#ccc", marginVertical: 2 },
  startButton: { backgroundColor: "#2563eb", padding: 12, marginTop: 16, borderRadius: 8, alignItems: "center" },
  dayCard: { padding: 14, borderRadius: 10, marginBottom: 10 },
  dayText: { color: "white", fontSize: 16 },
  infoBlock: { marginBottom: 20 },
});
