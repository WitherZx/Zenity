import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../screens/stacks/homeStack";

interface Props {
  image: any;
  text: string;
  moduleId: string;
}

type NavigationProp = StackNavigationProp<HomeStackParamList>;

export default function ContentModuleGrid({ image, text, moduleId }: Props) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("ModuleDetails", { moduleId })} style={styles.container}>
        <Image source={typeof image === "string" ? { uri: image } : image} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    padding: 10,
    flexDirection: "row",
    backgroundColor: "#49D0E7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    flexWrap: "wrap",
    flexShrink: 1,
  },
});
