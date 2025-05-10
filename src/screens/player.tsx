import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Animated, PanResponder, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Ionicons } from '@expo/vector-icons';
import { modules } from "../data/modulesData";
import { usePlayer } from '../contexts/PlayerContext';
import PlayerControlsSkeleton from '../components/PlayerControlsSkeleton';

type RootStackParamList = {
  Player: { moduleId: string; contentId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

type RouteParams = {
  moduleId?: string;
  contentId: string;
};

type AudioItem = {
  id: string;
  file: any;
  name: string;
  duration: number;
  thumbnail: any;
};

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds === undefined) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

function EnhancedAudioPlayer({ 
  audioQueue, 
  initialIndex = 0,
  moduleTitle,
  onNavigateToContent
}: {
  audioQueue: AudioItem[];
  initialIndex: number;
  moduleTitle: string;
  onNavigateToContent: (contentId: string) => void;
}) {
  const { 
    handleLoadAudio, 
    handlePlayPause, 
    handleSetPosition,
    handleSetLooping,
    sound,
    isPlaying,
    currentContent 
  } = usePlayer();

  const [state, setState] = useState({
    isLoading: true,
    loadError: null as string | null,
    currentIndex: initialIndex,
    position: 0,
    duration: 0,
    isRandom: false,
    isLooping: false,
    isDragging: false,
    lastPlayedIndices: [] as number[],
    queue: audioQueue,
    loadingProgress: 0,
  });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressRef = useRef<View>(null);
  const wasPlayingBeforeDrag = useRef(false);

  // Carrega o áudio quando o índice ou fila mudam
  useEffect(() => {
    // Verifica se já existe um áudio tocando e se é o mesmo que queremos carregar
    const currentAudio = state.queue[state.currentIndex];
    if (currentContent && currentAudio && currentContent.id === currentAudio.id) {
      // Se for o mesmo áudio, apenas atualiza o estado
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        loadingProgress: 1
      }));
      return;
    }

    // Se não for o mesmo áudio, carrega o novo
    loadAudio();
  }, [state.currentIndex, state.queue]);

  // Atualiza o loop quando muda
  useEffect(() => {
    if (sound) {
      handleSetLooping(state.isLooping);
    }
  }, [state.isLooping, sound]);

  // Atualiza a barra de progresso
  useEffect(() => {
    if (!state.isDragging && state.duration > 0) {
      progressAnim.setValue(state.position / state.duration);
    }
  }, [state.position, state.duration, state.isDragging]);

  // Monitora o progresso do áudio
  useEffect(() => {
    if (!sound) return;

    const interval = setInterval(async () => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setState(prev => ({
            ...prev,
            position: status.positionMillis / 1000,
            duration: status.durationMillis ? status.durationMillis / 1000 : 0
          }));
        }
      } catch (error) {
        console.error('Erro ao atualizar status do áudio:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sound]);

  // Pré-carrega o próximo áudio
  useEffect(() => {
    const preloadNextAudio = async () => {
      if (state.currentIndex < state.queue.length - 1) {
        try {
          const nextAudio = state.queue[state.currentIndex + 1];
          await Audio.Sound.createAsync(
            nextAudio.file,
            { shouldPlay: false },
            undefined,
            true
          );
          console.log('🎵 [Preload] Next audio preloaded successfully');
        } catch (error) {
          console.warn('⚠️ [Preload] Failed to preload next audio:', error);
        }
      }
    };

    if (!state.isLoading && sound) {
      preloadNextAudio();
    }
  }, [state.currentIndex, state.queue, sound, state.isLoading]);

  const loadAudio = async () => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      loadError: null,
      loadingProgress: 0 
    }));
    
    try {
      const currentAudio = state.queue[state.currentIndex];
      if (!currentAudio?.file) throw new Error("Arquivo de áudio inválido");

      const currentModule = modules.find(m => m.contents.some(c => c.id === currentAudio.id));
      if (!currentModule) throw new Error("Módulo não encontrado");

      // Simula o progresso do carregamento
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          loadingProgress: Math.min(prev.loadingProgress + 0.1, 0.9)
        }));
      }, 100);

      await handleLoadAudio({
        id: currentAudio.id,
        moduleId: currentModule.id,
        name: currentAudio.name,
        moduleName: moduleTitle,
        thumbnail: currentAudio.thumbnail,
        file: currentAudio.file,
        isLooping: state.isLooping
      });

      clearInterval(progressInterval);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        loadingProgress: 1
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loadError: `Não foi possível carregar o áudio: ${error.message}`,
        isLoading: false,
        loadingProgress: 0
      }));
    }
  };

  const handleNext = () => {
    if (state.currentIndex >= state.queue.length - 1) return;
    
    const nextIndex = state.currentIndex + 1;
    const nextAudio = state.queue[nextIndex];
    
    setState(prev => ({
      ...prev,
      lastPlayedIndices: [...prev.lastPlayedIndices, prev.currentIndex],
      currentIndex: nextIndex
    }));
    
    // Navega para o próximo áudio usando o ID do áudio da fila embaralhada
    onNavigateToContent(nextAudio.id);
  };

  const handlePrevious = () => {
    if (state.lastPlayedIndices.length > 0) {
      const lastIndex = state.lastPlayedIndices[state.lastPlayedIndices.length - 1];
      const previousAudio = state.queue[lastIndex];
      
      setState(prev => ({
        ...prev,
        currentIndex: lastIndex,
        lastPlayedIndices: prev.lastPlayedIndices.slice(0, -1)
      }));
      
      onNavigateToContent(previousAudio.id);
    } else if (state.currentIndex > 0) {
      const previousIndex = state.currentIndex - 1;
      const previousAudio = state.queue[previousIndex];
      
      setState(prev => ({ ...prev, currentIndex: previousIndex }));
      onNavigateToContent(previousAudio.id);
    }
  };

  const handleRandomize = () => {
    if (state.isRandom) {
      // Voltando para a ordem original
      const currentAudioId = state.queue[state.currentIndex].id;
      const originalIndex = audioQueue.findIndex(audio => audio.id === currentAudioId);
      
      setState(prev => ({
        ...prev,
        queue: audioQueue, // Restaura a fila original
        currentIndex: originalIndex, // Mantém o áudio atual na posição correta
        isRandom: false,
        lastPlayedIndices: []
      }));
    } else {
      // Entrando no modo aleatório
      const currentAudio = state.queue[state.currentIndex];
      const remainingAudios = state.queue.filter(audio => audio.id !== currentAudio.id);
      
      // Embaralha os áudios restantes
      for (let i = remainingAudios.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingAudios[i], remainingAudios[j]] = [remainingAudios[j], remainingAudios[i]];
      }
      
      // Cria a nova fila com o áudio atual no início
      const newQueue = [currentAudio, ...remainingAudios];
      
      setState(prev => ({
        ...prev,
        queue: newQueue,
        currentIndex: 0,
        isRandom: true,
        lastPlayedIndices: []
      }));
    }
  };

  const seekAudio = async (value: number) => {
    if (!sound) return;
    try {
      const newPosition = Math.floor(value * state.duration * 1000);
      await handleSetPosition(newPosition);
      setState(prev => ({ ...prev, position: value * state.duration }));
    } catch (error) {
      console.error('Erro ao buscar posição:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setState(prev => ({ ...prev, isDragging: true }));
        wasPlayingBeforeDrag.current = isPlaying;
        if (sound && isPlaying) handlePlayPause();
      },
      onPanResponderMove: (_, gestureState) => {
        progressRef.current?.measure((x, y, width, height, pageX) => {
          if (width) {
            const newValue = Math.max(0, Math.min(1, (gestureState.moveX - pageX) / width));
            progressAnim.setValue(newValue);
            setState(prev => ({ ...prev, position: newValue * prev.duration }));
          }
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        progressRef.current?.measure((x, y, width, height, pageX) => {
          if (width) {
            const newValue = Math.max(0, Math.min(1, (gestureState.moveX - pageX) / width));
            seekAudio(newValue);
            if (wasPlayingBeforeDrag.current) handlePlayPause();
            setState(prev => ({ ...prev, isDragging: false }));
          }
        });
      },
      onPanResponderTerminate: () => {
        setState(prev => ({ ...prev, isDragging: false }));
        if (wasPlayingBeforeDrag.current) handlePlayPause();
      },
    })
  ).current;

  const handleProgressBarTap = (event: any) => {
    if (!progressRef.current || !sound) return;
    
    progressRef.current.measure((x, y, width, height, pageX) => {
      if (width) {
        const newValue = Math.max(0, Math.min(1, (event.nativeEvent.pageX - pageX) / width));
        progressAnim.setValue(newValue);
        seekAudio(newValue);
      }
    });
  };

  if (state.isLoading) {
    return <PlayerControlsSkeleton />;
  }

  if (state.loadError) {
    return (
      <View style={playerStyles.errorContainer}>
        <Text style={playerStyles.errorText}>{state.loadError}</Text>
        <TouchableOpacity style={playerStyles.retryButton} onPress={loadAudio}>
          <Text style={playerStyles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={playerStyles.container}>
      <View style={playerStyles.progressContainer}>
        <Text style={playerStyles.timeText}>{formatTime(state.position)}</Text>
        <TouchableOpacity 
          activeOpacity={1} 
          style={playerStyles.progressBarWrapper} 
          onPress={handleProgressBarTap}
        >
          <View ref={progressRef} style={playerStyles.progressBar}>
            <Animated.View 
              style={[
                playerStyles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
            <Animated.View 
              {...panResponder.panHandlers} 
              style={[
                playerStyles.progressThumbContainer,
                {
                  left: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  transform: [{ translateX: -15 }],
                }
              ]}
            >
              <View style={playerStyles.progressThumb} />
            </Animated.View>
          </View>
        </TouchableOpacity>
        <Text style={playerStyles.timeText}>{formatTime(state.duration)}</Text>
      </View>
      
      <View style={playerStyles.controlsContainer}>
        <TouchableOpacity 
          style={[playerStyles.controlButton, state.isLooping && playerStyles.activeButton]} 
          onPress={() => setState(prev => ({ ...prev, isLooping: !prev.isLooping }))}
        >
          <Ionicons 
            name="repeat" 
            size={32} 
            color={state.isLooping ? "#24ABC2" : "#fff"} 
          />
        </TouchableOpacity>
        
        <View style={playerStyles.mainControls}>
          <TouchableOpacity 
            style={[
              playerStyles.controlButton, 
              (!state.lastPlayedIndices.length && state.currentIndex === 0) && playerStyles.disabledButton
            ]} 
            onPress={handlePrevious} 
            disabled={!state.lastPlayedIndices.length && state.currentIndex === 0}
          >
            <Ionicons 
              name="play-skip-back" 
              size={24} 
              color={(!state.lastPlayedIndices.length && state.currentIndex === 0) ? "#888" : "#0097B2"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={playerStyles.playButton} 
            onPress={handlePlayPause}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              playerStyles.controlButton, 
              (state.currentIndex >= state.queue.length - 1) && playerStyles.disabledButton
            ]} 
            onPress={handleNext} 
            disabled={state.currentIndex >= state.queue.length - 1}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={24} 
              color={state.currentIndex >= state.queue.length - 1 ? "#888" : "#0097B2"} 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[playerStyles.controlButton, state.isRandom && playerStyles.activeButton]} 
          onPress={handleRandomize}
        >
          <Ionicons 
            name="shuffle" 
            size={32} 
            color={state.isRandom ? "#24ABC2" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <View style={playerStyles.infoContainer}>
        <Text style={playerStyles.infoText}>
          {state.currentIndex + 1} de {state.queue.length}
        </Text>
      </View>
    </View>
  );
}

export default function Player() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const params = route.params as RouteParams;
  const { moduleId, contentId } = params;

  if (!moduleId || !contentId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: Parâmetros incompletos</Text>
          <Text style={styles.errorSubtext}>moduleId: {moduleId || "não fornecido"}</Text>
          <Text style={styles.errorSubtext}>contentId: {contentId || "não fornecido"}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const module = modules.find((m) => String(m.id) === String(moduleId));

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: Módulo não encontrado</Text>
          <Text style={styles.errorSubtext}>ID procurado: {moduleId}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const content = module.contents.find((c) => String(c.id) === String(contentId));

  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: Conteúdo não encontrado</Text>
          <Text style={styles.errorSubtext}>Módulo: {module.name}</Text>
          <Text style={styles.errorSubtext}>ID do conteúdo procurado: {contentId}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const audioQueue = module.contents.map(item => ({
    id: item.id,
    file: item.file,
    name: item.name,
    duration: item.duration,
    thumbnail: item.thumbnail
  }));

  const initialIndex = audioQueue.findIndex(item => String(item.id) === String(contentId));

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButtonSmall} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-down-outline" size={40} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <Image source={content.image3x4} style={styles.contentImage} resizeMode="cover" />
        <View>
          <Text style={styles.title}>{content.name}</Text>
          <Text style={styles.moduleTitle}>{module.name}</Text>        
        </View>
        <View style={styles.playerContainer}>
          <EnhancedAudioPlayer 
            audioQueue={audioQueue}
            initialIndex={initialIndex}
            moduleTitle={module.name}
            onNavigateToContent={(contentId) => {navigation.navigate('Player', { moduleId: moduleId, contentId: contentId});
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0CC0DF", padding: 20 },
  backButtonSmall: { padding: 8 },
  placeholder: { width: 40 },
  contentContainer: { flex: 1, alignItems: 'flex-start', gap: 30 },
  contentImage: { width: '100%', height: '60%', borderRadius: 20},
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", },
  moduleTitle: {fontSize: 14, color: "#fff", opacity: 0.8 },
  duration: { fontSize: 16, color: "#fff", opacity: 0.8 },
  playerContainer: { width: '100%', alignItems: 'center', justifyContent: 'center'},
  errorContainer: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 20, fontWeight: 'bold', color: "#fff", textAlign: "center"},
  errorSubtext: { fontSize: 16, color: "#fff", opacity: 0.8, textAlign: "center"},
  backButton: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25},
  backButtonText: { color: '#0CC0DF', fontSize: 16, fontWeight: 'bold' },
});

const playerStyles = StyleSheet.create({
  container: { width: '100%'},
  loadingContainer: { 
    height: 150, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  loadingText: { 
    color: '#fff', 
    fontSize: 16,
    marginTop: 10
  },
  loadingProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  loadingProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2
  },
  errorContainer: { height: 150, justifyContent: 'center', alignItems: 'center', padding: 16 },
  errorText: { color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  retryButtonText: { color: '#fff', fontSize: 14 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timeText: { color: '#fff', fontSize: 12, width: 40, textAlign: 'center' },
  progressBarWrapper: { flex: 1, height: 30, justifyContent: 'center', marginHorizontal: 8 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, position: 'relative' },
  progressFill: { height: 4, backgroundColor: '#fff', borderRadius: 2, position: 'absolute', left: 0, top: 0 },
  progressThumbContainer: { width: 30, height: 30, position: 'absolute', top: -13, justifyContent: 'center', alignItems: 'center' },
  progressThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  mainControls: {backgroundColor: '#fff', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 50 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, paddingBottom: 15 },
  controlButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6 },
  playButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0097B2', justifyContent: 'center', alignItems: 'center', marginHorizontal: 12 },
  disabledButton: { opacity: 0.5 },
  activeButton: { backgroundColor: '#fff' },
  infoContainer: { alignItems: 'center' },
  infoText: { color: '#fff', fontSize: 14, opacity: 0.8 },
});
