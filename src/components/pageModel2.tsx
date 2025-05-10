import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function PageModel2({ icon, title, subtitle, children }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={40} />
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>{title}</Text>
          <Text>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 50,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textContainer: {
    flexDirection: "column",
  },
  mainTitle: {
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 50,
    backgroundColor: "#0097B2",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
});
