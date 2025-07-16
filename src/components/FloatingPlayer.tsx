import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { usePlayer } from '../contexts/PlayerContext';
import { getModules } from '../data/modulesData';

export default function FloatingPlayer() {
  const navigation = useNavigation<any>();
  const { currentContent, isPlaying, handlePlayPause, handleLoadAudio, handleUnloadAudio } = usePlayer();
  
  // Animação para o slide
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const [isRemoving, setIsRemoving] = React.useState(false);

  const [modules, setModules] = React.useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchModules() {
      try {
        const data = await getModules();
        setModules(data || []);
      } catch (e) {
        setModules([]);
      }
      setModulesLoading(false);
    }
    fetchModules();
  }, []);

  // Reset do estado quando um novo conteúdo é carregado ou a navegação muda
  React.useEffect(() => {
    const resetState = () => {
      setIsRemoving(false);
      slideAnim.setValue(0);
      opacityAnim.setValue(1);
    };

    // Reset quando um novo conteúdo é carregado
    if (currentContent) {
      resetState();
    }

    // Adiciona listener para mudanças na navegação
    const unsubscribe = navigation.addListener('state', resetState);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [currentContent, navigation]);

  // PanResponder para o gesto de swipe
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Não captura o toque inicial
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Só permite o gesto se for um movimento horizontal significativo
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isRemoving) return; // Não permite movimento se já estiver removendo
        // Atualiza a posição do player com base no gesto
        slideAnim.setValue(gestureState.dx);
        // Diminui a opacidade conforme desliza
        const opacity = Math.max(0, 1 - Math.abs(gestureState.dx) / 200);
        opacityAnim.setValue(opacity);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isRemoving) return; // Não processa o release se já estiver removendo
        
        // Se o swipe foi suficientemente longo, remove o player
        if (Math.abs(gestureState.dx) > 100) {
          setIsRemoving(true);
          
          // Para o áudio imediatamente
          if (isPlaying) {
            handlePlayPause();
          }
          handleUnloadAudio();
          
          // Inicia a animação de saída
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: gestureState.dx > 0 ? 400 : -400,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Se não, volta para a posição original
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacityAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;
  
  // Simplifica a verificação para mostrar/esconder o player flutuante
  const isInPlayer = useNavigationState(state => {
    if (!state?.routes) return false;

    // Função para verificar se uma rota ou suas sub-rotas é Player
    const isPlayerRoute = (route: any): boolean => {
      console.log('FloatingPlayer: Verificando rota:', route.name);
      
      // Verifica se a rota atual é Player
      if (route.name === 'Player') {
        console.log('FloatingPlayer: Encontrou tela Player, ocultando FloatingPlayer');
        return true;
      }

      // Verifica nas sub-rotas
      if (route.state?.routes) {
        const activeRoute = route.state.routes[route.state.index];
        return isPlayerRoute(activeRoute);
      }

      return false;
    };

    // Obtém a rota ativa atual
    const activeRoute = state.routes[state.index];
    const inPlayer = isPlayerRoute(activeRoute);
    
    console.log('FloatingPlayer: isInPlayer =', inPlayer);
    return inPlayer;
  });

  // Só mostra o player flutuante se:
  // 1. Tiver um áudio atual
  // 2. NÃO estiver na página do player (Player)
  // 3. NÃO estiver em processo de remoção
  React.useEffect(() => {
    console.log('FloatingPlayer: Estados de visibilidade:', {
      hasCurrentContent: !!currentContent,
      isInPlayer,
      isRemoving,
      shouldShow: !(!currentContent || isInPlayer || isRemoving)
    });
  }, [currentContent, isInPlayer, isRemoving]);

  if (!currentContent || isInPlayer || isRemoving) {
    return null;
  }

  const navigateToContent = (moduleId: string, contentId: string) => {
    try {
      console.log('FloatingPlayer: Navegando para Player com:', { moduleId, contentId });
      
      // Navegação simplificada - sempre vai para o Home stack e depois para o Player
      navigation.navigate('TabsNav', {
        screen: 'Home',
        params: {
          screen: 'Player',
          params: { moduleId, contentId }
        }
      });
    } catch (error) {
      console.error('FloatingPlayer: Erro na navegação:', error);
      
      // Fallback ainda mais simples
      try {
        navigation.navigate('Player', { moduleId, contentId });
      } catch (fallbackError) {
        console.error('FloatingPlayer: Erro no fallback:', fallbackError);
      }
    }
  };

  const handleNext = () => {
    if (!modules || !Array.isArray(modules) || !currentContent) return;
      const currentModule = modules.find(m => m.id === currentContent?.moduleId);
      if (!currentModule) return;
    const currentIndex = currentModule.contents.findIndex((c: any) => c.id === currentContent?.id);
      if (currentIndex < currentModule.contents.length - 1) {
        const nextContent = currentModule.contents[currentIndex + 1];
      const wasPlaying = isPlaying;
        if (handleLoadAudio) {
          handleLoadAudio({
            id: nextContent.id,
            moduleId: currentModule.id,
            name: nextContent.name,
            moduleName: currentModule.name,
            thumbnail: nextContent.thumbnail,
            file: nextContent.file
          }).then(() => {
            if (wasPlaying) {
              handlePlayPause();
            }
          });
        }
    }
  };

  const handlePrevious = () => {
    if (!modules || !Array.isArray(modules) || !currentContent) return;
      const currentModule = modules.find(m => m.id === currentContent?.moduleId);
      if (!currentModule) return;
    const currentIndex = currentModule.contents.findIndex((c: any) => c.id === currentContent?.id);
      if (currentIndex > 0) {
        const previousContent = currentModule.contents[currentIndex - 1];
      const wasPlaying = isPlaying;
        if (handleLoadAudio) {
          handleLoadAudio({
            id: previousContent.id,
            moduleId: currentModule.id,
            name: previousContent.name,
            moduleName: currentModule.name,
            thumbnail: previousContent.thumbnail,
            file: previousContent.file
          }).then(() => {
            if (wasPlaying) {
              handlePlayPause();
            }
          });
        }
    }
  };

  const handleOpenPlayer = () => {
    console.log('FloatingPlayer: handleOpenPlayer chamado');
    
    if (!currentContent) {
      console.log('FloatingPlayer: Não há currentContent');
      return;
    }
    
    console.log('FloatingPlayer: Dados do currentContent:', {
      id: currentContent.id,
      moduleId: currentContent.moduleId,
      name: currentContent.name
    });
    
    navigateToContent(currentContent.moduleId, currentContent.id);
  };

  const hasNextTrack = () => {
    if (!modules || !Array.isArray(modules) || !currentContent) return false;
      const currentModule = modules.find(m => m.id === currentContent.moduleId);
      if (!currentModule) return false;
    const currentIndex = currentModule.contents.findIndex((c: any) => c.id === currentContent.id);
      return currentIndex < currentModule.contents.length - 1;
  };

  const hasPreviousTrack = () => {
    if (!modules || !Array.isArray(modules) || !currentContent) return false;
      const currentModule = modules.find(m => m.id === currentContent.moduleId);
      if (!currentModule) return false;
    const currentIndex = currentModule.contents.findIndex((c: any) => c.id === currentContent.id);
      return currentIndex > 0;
  };

  if (modulesLoading) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        style={styles.mainContent} 
        onPress={handleOpenPlayer}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <Image 
          source={currentContent.thumbnail} 
          style={styles.thumbnail}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentContent.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {currentContent.moduleName}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={handlePrevious}
          disabled={!hasPreviousTrack()}
          style={!hasPreviousTrack() && styles.disabledButton}
        >
          <Ionicons 
            name="play-skip-back" 
            size={24} 
            color={hasNextTrack() ? "#0097B2" : "#ccc"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="#0097B2" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNext}
          disabled={!hasNextTrack()}
          style={!hasNextTrack() && styles.disabledButton}
        >
          <Ionicons 
            name="play-skip-forward" 
            size={24} 
            color={hasNextTrack() ? "#0097B2" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  thumbnail: {
    width: 65,
    height: 50,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0097B2',
  },
  subtitle: {
    fontSize: 12,
    color: '#24ABC2',
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 