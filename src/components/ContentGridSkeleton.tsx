import React from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';

export default function ContentGridSkeleton() {
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

  const renderSkeletonItem = () => (
    <View style={styles.itemContainer}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.textContainer}>
        <Animated.View style={[styles.titleBar, { opacity }]} />
        <Animated.View style={[styles.timeBar, { opacity }]} />
      </View>
      <Animated.View style={[styles.chevron, { opacity }]} />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <React.Fragment key={item}>
          {renderSkeletonItem()}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
    marginBottom: 100,
  },
  itemContainer: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 5,
  },
  titleBar: {
    height: 16,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  timeBar: {
    height: 14,
    width: '40%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  chevron: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
}); 