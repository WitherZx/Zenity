import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { usePlayer } from '../contexts/PlayerContext';
import { modules } from '../data/modulesData';

export default function FloatingPlayer() {
  const navigation = useNavigation<any>();
  const { currentContent, isPlaying, handlePlayPause, handleLoadAudio, handleUnloadAudio } = usePlayer();
  
  // Animação para o slide
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const [isRemoving, setIsRemoving] = React.useState(false);

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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Só permite o gesto se for um movimento horizontal significativo
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
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

  // Debug do ciclo de vida do componente
  React.useEffect(() => {
    console.log('FloatingPlayer mounted/updated:', {
      hasCurrentContent: !!currentContent,
      isPlaying,
      currentContentId: currentContent?.id
    });
    return () => {
      console.log('FloatingPlayer will unmount');
    };
  }, [currentContent, isPlaying]);
  
  // Simplifica a verificação para mostrar/esconder o player flutuante
  const isInPlayer = useNavigationState(state => {
    if (!state?.routes) return false;

    // Função para verificar se uma rota ou suas sub-rotas é Player
    const isPlayerRoute = (route: any): boolean => {
      // Verifica se a rota atual é Player e está focada
      if (route.name === 'Player' && route.state?.index === undefined) {
        return true;
      }

      // Verifica nas sub-rotas
      if (route.state?.routes) {
        return route.state.routes.some(isPlayerRoute);
      }

      return false;
    };

    // Verifica todas as rotas ativas
    return state.routes.some(isPlayerRoute);
  });

  // Debug da decisão de renderização
  console.log('Render decision:', {
    hasCurrentContent: !!currentContent,
    isInPlayer,
    willRender: !(!currentContent || isInPlayer)
  });

  // Só mostra o player flutuante se:
  // 1. Tiver um áudio atual
  // 2. NÃO estiver na página do player (Player)
  // 3. NÃO estiver em processo de remoção
  if (!currentContent || isInPlayer || isRemoving) {
    return null;
  }

  const navigateToContent = (moduleId: string, contentId: string) => {
    try {
      // Obtém o estado atual da navegação
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      
      // Navega para o Player dentro da stack atual
      const params = { moduleId, contentId };

      // Navega para a rota correta baseado na tab atual
      switch (currentRoute.name) {
        case 'TabsNav':
          const currentTab = currentRoute.state?.routes[currentRoute.state.index];
          switch (currentTab?.name) {
            case 'Inicio':
              navigation.navigate('TabsNav', {
                screen: 'Inicio',
                params: {
                  screen: 'Player',
                  params
                }
              });
              break;
            case 'Busca':
              navigation.navigate('TabsNav', {
                screen: 'Busca',
                params: {
                  screen: 'Player',
                  params
                }
              });
              break;
            case 'Premium':
              navigation.navigate('TabsNav', {
                screen: 'Premium',
                params: {
                  screen: 'Player',
                  params
                }
              });
              break;
            case 'Minha Conta':
              navigation.navigate('TabsNav', {
                screen: 'Minha Conta',
                params: {
                  screen: 'Player',
                  params
                }
              });
              break;
            default:
              // Fallback para a home stack
              navigation.navigate('TabsNav', {
                screen: 'Inicio',
                params: {
                  screen: 'Player',
                  params
                }
              });
          }
          break;
        default:
          // Fallback para a home stack
          navigation.navigate('TabsNav', {
            screen: 'Inicio',
            params: {
              screen: 'Player',
              params
            }
          });
      }
    } catch (error) {
      console.error('Error navigating to content:', error);
    }
  };

  const handleNext = () => {
    try {
      const currentModule = modules.find(m => m.id === currentContent?.moduleId);
      if (!currentModule) return;

      const currentIndex = currentModule.contents.findIndex(c => c.id === currentContent?.id);
      if (currentIndex < currentModule.contents.length - 1) {
        const nextContent = currentModule.contents[currentIndex + 1];
        const wasPlaying = isPlaying; // Guarda o estado de reprodução atual
        
        // Atualiza apenas o conteúdo atual sem navegar
        if (handleLoadAudio) {
          handleLoadAudio({
            id: nextContent.id,
            moduleId: currentModule.id,
            name: nextContent.name,
            moduleName: currentModule.name,
            thumbnail: nextContent.thumbnail,
            file: nextContent.file
          }).then(() => {
            // Se estava tocando, continua tocando o próximo
            if (wasPlaying) {
              handlePlayPause();
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling next track:', error);
    }
  };

  const handlePrevious = () => {
    try {
      const currentModule = modules.find(m => m.id === currentContent?.moduleId);
      if (!currentModule) return;

      const currentIndex = currentModule.contents.findIndex(c => c.id === currentContent?.id);
      if (currentIndex > 0) {
        const previousContent = currentModule.contents[currentIndex - 1];
        const wasPlaying = isPlaying; // Guarda o estado de reprodução atual
        
        // Atualiza apenas o conteúdo atual sem navegar
        if (handleLoadAudio) {
          handleLoadAudio({
            id: previousContent.id,
            moduleId: currentModule.id,
            name: previousContent.name,
            moduleName: currentModule.name,
            thumbnail: previousContent.thumbnail,
            file: previousContent.file
          }).then(() => {
            // Se estava tocando, continua tocando o anterior
            if (wasPlaying) {
              handlePlayPause();
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling previous track:', error);
    }
  };

  const handleOpenPlayer = () => {
    if (!currentContent) return;
    navigateToContent(currentContent.moduleId, currentContent.id);
  };

  const hasNextTrack = () => {
    try {
      const currentModule = modules.find(m => m.id === currentContent.moduleId);
      if (!currentModule) return false;

      const currentIndex = currentModule.contents.findIndex(c => c.id === currentContent.id);
      return currentIndex < currentModule.contents.length - 1;
    } catch (error) {
      console.error('Error checking next track:', error);
      return false;
    }
  };

  const hasPreviousTrack = () => {
    try {
      const currentModule = modules.find(m => m.id === currentContent.moduleId);
      if (!currentModule) return false;

      const currentIndex = currentModule.contents.findIndex(c => c.id === currentContent.id);
      return currentIndex > 0;
    } catch (error) {
      console.error('Error checking previous track:', error);
      return false;
    }
  };

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
            color={hasPreviousTrack() ? "#0097B2" : "#ccc"} 
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