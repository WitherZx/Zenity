import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Animated } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getModules } from "../data/modulesData";
import ContentGrid from "../components/contentGrid";
import ContentGridSkeleton from "../components/ContentGridSkeleton";

function ModuleDetailsSkeleton() {
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

  return (
    <View style={Styles.container}>
      <Animated.View style={[Styles.skeletonMainImage, { opacity }]} />
      <Animated.View style={[Styles.skeletonTitle, { opacity }]} />
      <ContentGridSkeleton />
    </View>
  );
}

export default function ModuleDetail() {
  const route = useRoute();
  const moduleId = (route.params as { moduleId?: string })?.moduleId;
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModule() {
      try {
        const modules = await getModules();
        const found = modules.find((m: any) => m.id.toString() === moduleId?.toString());
        setModule(found || null);
      } catch (e) {
        setModule(null);
      }
      setLoading(false);
    }
    fetchModule();
  }, [moduleId]);

  if (loading) {
    return <ModuleDetailsSkeleton />;
  }

  if (!module) {
    return (
      <View style={Styles.container}>
        <Text style={Styles.errorText}>Error: Module not found</Text>
      </View>
    );
  }

  // Adiciona o moduleId a cada conteúdo
  const contentsWithModuleId = module.contents.map((content: any) => ({
    ...content,
    moduleId: module.id
  }));

  return (
    <View style={Styles.container}>
        <Image source={module.image} style={Styles.mainImage} resizeMode="cover" />
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
    width: '100%',
    height: 350,
    borderRadius: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  skeletonMainImage: {
    width: '100%',
    height: 350,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  skeletonTitle: {
    height: 24,
    width: '50%',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 20,
  },
});
