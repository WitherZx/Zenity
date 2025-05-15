import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Animated } from "react-native";
import ContentModuleGrid from "./contentModuleGrid";
import { getModules } from "../data/modulesData";

interface Module {
  id: string;
  name: string;
  image: any;
  contents: any[];
}

function ModulesGridSkeleton() {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonItem = (key: number) => (
    <View style={styles.skeletonContainer} key={key}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.skeletonTextContainer}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map(renderSkeletonItem)}
      </View>
    </ScrollView>
  );
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

  if (loading) return <ModulesGridSkeleton />;
  if (!modules || modules.length === 0) return <Text>Nenhum módulo encontrado.</Text>;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {modules.map((module) => (
        <ContentModuleGrid
          key={module.id}
            image={module.image}
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
  skeletonContainer: {
    gap: 10,
    padding: 10,
    flexDirection: "row",
    backgroundColor: "#49D0E7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  skeletonImage: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 18,
    width: '70%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
});
