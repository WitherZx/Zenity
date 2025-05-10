import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import ItemGrid from "./itemGrid"; // Certifique-se de que o caminho está correto

type Content = {
  id: string;
  moduleId: string;
  name: string;
  thumbnail: any;
  file: any;
  duration: number;
};

type ContentGridProps = {
  contents: Content[];
};

export default function ContentGrid({ contents }: ContentGridProps) {
  console.log("ContentGrid: Recebendo contents:", contents);

  if (!contents || contents.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
      {contents.map((item) => (
        <ItemGrid
          key={`${item.moduleId}-${item.id}`}
          contentId={item.id}
          moduleId={item.moduleId}
          image={item.thumbnail}
          text={item.name}
          duration={item.duration}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    flexDirection: "column",
    gap: 15,
    marginBottom: 100,
  },
});