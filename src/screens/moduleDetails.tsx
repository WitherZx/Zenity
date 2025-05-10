import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { modules } from "../data/modulesData";
import ContentGrid from "../components/contentGrid";

export default function ModuleDetail() {
  const route = useRoute();
  const moduleId = (route.params as { moduleId?: string })?.moduleId;

  const module = modules.find((m) => m.id.toString() === moduleId?.toString());

  if (!module) {
    return (
      <View style={Styles.container}>
        <Text style={Styles.errorText}>Erro: Módulo não encontrado</Text>
      </View>
    );
  }

  // Adiciona o moduleId a cada conteúdo
  const contentsWithModuleId = module.contents.map(content => ({
    ...content,
    moduleId: module.id
  }));

  return (
    <View style={Styles.container}>
        <Image source={module.image1x1} style={Styles.mainImage} />
        <Text style={Styles.title}>{module.name}</Text>
        <ScrollView style={Styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <ContentGrid contents={contentsWithModuleId} />
        </ScrollView>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    backgroundColor: "#0097B2",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 30,
  },
  scrollContainer: {
    width: '100%',
    flexGrow: 1,
    paddingRight: 5,
    gap: 30,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,
  },
  mainImage: {
    maxHeight: "40%",
    maxWidth: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
    borderRadius: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
});
