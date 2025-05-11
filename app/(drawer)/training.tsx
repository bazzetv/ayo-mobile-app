import { View, Text, StyleSheet } from "react-native";

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Screen Training in progress</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
});