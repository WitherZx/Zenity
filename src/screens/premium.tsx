import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PageModel2 from "../components/pageModel2"; // Ajuste o caminho conforme necessário

export default function Premium() {
  return (
    <PageModel2 icon="diamond-outline" title="Plano Premium" subtitle="Assinatura">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premium</Text>
        <Text style={styles.price}>R$9,90/mês</Text>
        <View style={styles.divider} />
        <Text style={styles.feature}>Sem anúncios</Text>
        <Text style={styles.feature}>Melhor qualidade de áudio</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Ionicons name={"diamond-outline"} size={20} color="#00A0B0" />
        <Text style={styles.buttonText}>Assinar o premium</Text>
      </TouchableOpacity>
    </PageModel2>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    width: "100%",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "#555",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  feature: {
    fontSize: 14,
    color: "#333",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "100%",
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#00A0B0",
  },
});
