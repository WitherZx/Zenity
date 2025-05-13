import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import ContentModuleGrid from "./contentModuleGrid";
import { getModules } from "../data/modulesData";

interface Module {
  id: string;
  name: string;
  thumbnail: any;
  image1x1: any;
  contents: any[];
}

export default function ModulesGrid() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const data = await getModules();
        setModules(data || []);
      } catch (e) {
        setModules([]);
      }
      setLoading(false);
    }
    fetchModules();
  }, []);

  if (loading) return <Text>Carregando módulos...</Text>;
  if (!modules || modules.length === 0) return <Text>Nenhum módulo encontrado.</Text>;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {modules.map((module) => (
          <ContentModuleGrid
            key={module.id}
            image={module.thumbnail}
            text={module.name}
            moduleId={module.id}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "column",
    gap: 15, 
    paddingBottom: 105,
  },
});
