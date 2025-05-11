import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert } from "react-native";


const SERVER_URL = "http://localhost:8080/private/programs";
const { width } = Dimensions.get("window");
const fallbackPrograms = {
  started: [
    {
      id: "f1",
      title: "Upper/Lower Hypertrophy",
      description: "Programme 5j / semaine sur 10 semaines",
      imageUrl: "http://localhost:9000/terra-ai-bucket/ayo/programs/program1.webp",
      progress: "Semaine 2 / 10",
    },
  ],
  not_started: [
    {
      id: "f2",
      title: "Body Recomp",
      description: "Transformation complète sur 12 semaines",
      imageUrl: "http://localhost:9000/terra-ai-bucket/ayo/programs/program2.webp",
    },
  ],
  finished: [
    {
      id: "f3",
      title: "CrossFit Metcon",
      description: "Intensité maximale sur 6 semaines",
      imageUrl: "http://localhost:9000/terra-ai-bucket/ayo/programs/program3.webp",
    },
  ],
};

const pages = ["🔥 In progress", "🚀 To discover", "✅ Done"];

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState({ started: [], not_started: [], finished: [] });
  const scrollX = useRef(new Animated.Value(0)).current;
  const [pageIndex, setPageIndex] = useState(0);

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleProgramPress = async (programId) => {
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
      });
      setShowModal(true);
    } catch (err) {
      console.error("Erreur lors du chargement du programme :", err);
    }
  };

  const renderCard = (item) => (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleProgramPress(item.id)}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        {item.progress && <Text style={styles.progressText}>{item.progress}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderPage = (title, data) => (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>{title}</Text>
      {data.map(renderCard)}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

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
        renderItem={({ item, index }) => renderPage(pages[index], item)}
      />
      <View style={styles.indicators}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.dot, i === pageIndex && styles.activeDot]} />
        ))}
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProgram && (
              <>
                <Text style={styles.modalTitle}>{selectedProgram.title}</Text>
                <Text style={styles.modalSubtitle}>{selectedProgram.description}</Text>

                <View style={styles.infoBlock}>
                  <Text style={styles.modalLine}>📆 Durée : {selectedProgram.durationWeeks} semaines</Text>
                  <Text style={styles.modalLine}>🧑‍🏫 Coach : {selectedProgram.coachName}</Text>
                  <Text style={styles.modalLine}>
                    📌 Statut : {selectedProgram.status === "not_started"
                      ? "Pas encore démarré"
                      : selectedProgram.status === "started"
                        ? "En cours"
                        : "Terminé"}
                  </Text>


                  {selectedProgram.status === "started" && (
                    <>
                      <Text style={styles.modalLine}>📅 Semaine actuelle : {selectedProgram.currentWeek}</Text>
                      <Text style={styles.modalLine}>📅 Jour actuel : {selectedProgram.currentDay}</Text>
                    </>
                  )}

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

                      const router = useRouter();

                      if (res.status === 409) {
                        Alert.alert(
                          "Programme déjà démarré",
                          "Ce programme a déjà été commencé. Redirection vers votre entraînement en cours.",
                          [
                            {
                              text: "OK",
                              onPress: () => {
                                setShowModal(false); // Fermer la modal
                                router.push("/(drawer)/training"); // Redirection
                              }
                            }
                          ]
                        );
                        setShowModal(false);
                        router.push("/(drawer)/training");
                        return;
                      }

                      if (!res.ok) throw new Error("Erreur lors du démarrage");

                      const data = await res.json();
                      const { progressId } = data;

                      setShowModal(false); // ✅ Fermer la modal proprement
                      router.push({
                        pathname: "/(drawer)/training",
                        params: {
                          program: JSON.stringify(selectedProgram),
                          progressId,
                        },
                      });
                    } catch (err) {
                      console.error("Erreur démarrage :", err);
                    }
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Démarrer le programme</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={{ marginTop: 20, color: "#ccc" }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 40,
  },
  page: {
    width,
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  card: {
    width: '48%',
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    margin: 5,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardTextContainer: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cardDescription: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 6,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 16,
    backgroundColor: "#2563eb",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  modalText: {
    fontSize: 14,
    color: "#ccc",
    marginVertical: 4,
  },
  startButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    marginBottom: 16,
  },

  infoBlock: {
    marginBottom: 20,
  },

  modalLine: {
    fontSize: 14,
    color: "#ccc",
    marginVertical: 2,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  tag: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 12,
    color: '#fff',
  },
});