import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { StyleSheet } from 'react-native';
// import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
// import { useAuth } from '../contexts/AuthContext';

interface PlayerContextData {
  isPlaying: boolean;
  isBuffering: boolean;
  bufferProgress: number;
  currentContent: {
    id: string;
    moduleId: string;
    name: string;
    moduleName: string;
    thumbnail: any;
    file: any;
  } | null;
  sound: Audio.Sound | null;
  handlePlayPause: () => Promise<void>;
  handleLoadAudio: (params: {
    file: any;
    id: string;
    moduleId: string;
    name: string;
    moduleName: string;
    thumbnail: any;
    isLooping?: boolean;
  }) => Promise<void>;
  handleUnloadAudio: () => Promise<void>;
  handleSetPosition: (position: number) => Promise<void>;
  handleSetLooping: (isLooping: boolean) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextData>({
  isPlaying: false,
  isBuffering: false,
  bufferProgress: 0,
  currentContent: null,
  sound: null,
  handlePlayPause: async () => {},
  handleLoadAudio: async () => {},
  handleUnloadAudio: async () => {},
  handleSetPosition: async () => {},
  handleSetLooping: async () => {},
});

const BUFFER_THRESHOLD = 5000; // 5 segundos de buffer necessário
const UPDATE_INTERVAL = 100; // Atualiza o buffer a cada 100ms

// const INTERSTITIAL_AD_UNIT_ID = __DEV__
//   ? 'ca-app-pub-3940256099942544/1033173712' // ID de teste do Google
//   : 'ca-app-pub-5233713899126724/7937661732'; // Seu ID real

// function showInterstitialAd(onClosed: () => void) {
//   const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
//     requestNonPersonalizedAdsOnly: true,
//   });
//   const unsubscribe = interstitial.onAdEvent((type) => {
//     if (type === AdEventType.CLOSED || type === AdEventType.ERROR) {
//       unsubscribe();
//       onClosed();
//     }
//   });
//   interstitial.load();
//   interstitial.show();
// }

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [currentContent, setCurrentContent] = useState<PlayerContextData['currentContent']>(null);

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
  }, [sound, isPlaying, currentContent, isBuffering]);

  const handleUnloadAudio = useCallback(async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        
        await sound.unloadAsync();
        
        setSound(null);
        setIsPlaying(false);
        setCurrentContent(null);
        setBufferProgress(0);
      }
    } catch (error) {
      setSound(null);
      setIsPlaying(false);
      setCurrentContent(null);
      setBufferProgress(0);
    }
  }, [sound]);

  const handleLoadAudio = useCallback(async (params: {
    file: any;
    id: string;
    moduleId: string;
    name: string;
    moduleName: string;
    thumbnail: any;
    isLooping?: boolean;
  }) => {
    setIsBuffering(true);
    setBufferProgress(0);
    
    try {
      if (!params.file) {
        throw new Error('Arquivo de áudio não fornecido');
      }

      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create new sound instance
      const { sound: newSound } = await Audio.Sound.createAsync(
        params.file,
        { 
          shouldPlay: false,
          isLooping: params.isLooping || false,
          progressUpdateIntervalMillis: UPDATE_INTERVAL,
          positionMillis: 0,
        },
        (status) => {
          if (status.isLoaded) {
            const position = status.positionMillis || 0;
            const buffered = status.playableDurationMillis ?? position;
            const bufferAhead = buffered - position;
            
            const progress = Math.min((bufferAhead / BUFFER_THRESHOLD) * 100, 100);
            setBufferProgress(progress);
            
            if (bufferAhead >= BUFFER_THRESHOLD && isBuffering) {
              setIsBuffering(false);
            }

            setIsPlaying(status.isPlaying);
          }
        },
        true
      );
      
      // Set the new sound and content
      setSound(newSound);
      setCurrentContent({
        id: params.id,
        moduleId: params.moduleId,
        name: params.name,
        moduleName: params.moduleName,
        thumbnail: params.thumbnail,
        file: params.file
      });

      // Start buffering without playing
      await newSound.playAsync();
      await newSound.pauseAsync();
      setIsBuffering(false);

    } catch (error) {
      setIsBuffering(false);
      setBufferProgress(0);
      await handleUnloadAudio();
      throw error;
    }
  }, [handleUnloadAudio, sound]);

  const handlePlayPause = useCallback(async () => {
    if (!sound) return;

    // --- INTEGRAÇÃO PREMIUM ---
    // Descomente para ativar na build nativa:
    // const { user } = useAuth();
    // const isPremium = !!user?.is_premium;
    // if (!isPremium && !isPlaying) {
    //   showInterstitialAd(async () => {
    //     // Após fechar o anúncio, executa o play normal
    //     try {
    //       const status = await sound.getStatusAsync();
    //       if (status.isLoaded) {
    //         const bufferAhead = (status.playableDurationMillis ?? 0) - status.positionMillis;
    //         if (bufferAhead >= BUFFER_THRESHOLD) {
    //           await sound.playAsync();
    //           setIsPlaying(true);
    //           setIsBuffering(false);
    //         } else {
    //           setIsBuffering(true);
    //           await sound.playAsync();
    //           await sound.pauseAsync();
    //         }
    //       }
    //     } catch (error) {}
    //   });
    //   return;
    // }
    // --- FIM INTEGRAÇÃO PREMIUM ---

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          const bufferAhead = (status.playableDurationMillis ?? 0) - status.positionMillis;
          if (bufferAhead >= BUFFER_THRESHOLD) {
            await sound.playAsync();
            setIsPlaying(true);
            setIsBuffering(false);
          } else {
            setIsBuffering(true);
            await sound.playAsync();
            await sound.pauseAsync();
          }
        }
      }
    } catch (error) {}
  }, [sound, isPlaying]);

  const handleSetPosition = useCallback(async (position: number) => {
    if (!sound) {
      return;
    }
    
    try {
      await sound.setPositionAsync(position);
    } catch (error) {
    }
  }, [sound]);

  const handleSetLooping = useCallback(async (isLooping: boolean) => {
    try {
      if (sound?.getStatusAsync) {
        const status = await sound.getStatusAsync();
        
        if (status.isLoaded) {
          await sound.setIsLoopingAsync(isLooping);
        }
      }
    } catch (error) {
    }
  }, [sound]);

  return (
    <PlayerContext.Provider value={{
      sound,
      isPlaying,
      isBuffering,
      bufferProgress,
      currentContent,
      handlePlayPause,
      handleLoadAudio,
      handleUnloadAudio,
      handleSetPosition,
      handleSetLooping,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  playerContainer: {
    flex: 1,
  },
  bufferingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bufferingText: {
    color: '#fff',
    marginLeft: 10,
  },
});