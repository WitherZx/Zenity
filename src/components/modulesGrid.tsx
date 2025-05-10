import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import ContentModuleGrid from "./contentModuleGrid";
import { modules } from "../data/modulesData";

export default function ModulesGrid() {
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
