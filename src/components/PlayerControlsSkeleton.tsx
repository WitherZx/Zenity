import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function PlayerControlsSkeleton() {
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
    <View style={styles.container}>
      {/* Barra de Progresso */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.timeText, { opacity }]} />
        <View style={styles.progressBarWrapper}>
          <Animated.View style={[styles.progressBar, { opacity }]} />
        </View>
        <Animated.View style={[styles.timeText, { opacity }]} />
      </View>

      {/* Controles */}
      <View style={styles.controlsContainer}>
        <Animated.View style={[styles.controlButton, { opacity }]} />
        
        <View style={styles.mainControls}>
          <Animated.View style={[styles.controlButton, { opacity }]} />
          <Animated.View style={[styles.playButton, { opacity }]} />
          <Animated.View style={[styles.controlButton, { opacity }]} />
        </View>
        
        <Animated.View style={[styles.controlButton, { opacity }]} />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Animated.View style={[styles.infoText, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    width: 40,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressBarWrapper: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingBottom: 15,
  },
  mainControls: {
    backgroundColor: '#fff',
    width: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 50,
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0097B2',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    width: 60,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
}); 