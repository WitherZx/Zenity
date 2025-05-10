import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { StyleSheet } from 'react-native';

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

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [currentContent, setCurrentContent] = useState<PlayerContextData['currentContent']>(null);

  useEffect(() => {
    console.warn('🎵 [PlayerProvider] Initialized');
    return () => console.warn('🎵 [PlayerProvider] Cleanup');
  }, []);

  useEffect(() => {
    console.warn('🎵 [PlayerProvider] State Update:', {
      hasSound: !!sound,
      isPlaying,
      currentContentId: currentContent?.id,
      isBuffering
    });

    const monitorAudioStatus = async () => {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          console.warn('🎵 [Audio Status]', {
            isLoaded: status.isLoaded,
            ...(status.isLoaded ? {
              isPlaying: status.isPlaying,
              positionMillis: status.positionMillis,
              durationMillis: status.durationMillis,
              isBuffering: status.isBuffering,
              shouldPlay: status.shouldPlay,
              isLooping: status.isLooping,
              volume: status.volume,
              didJustFinish: status.didJustFinish
            } : {})
          });
        } catch (error) {
          console.error('❌ [Audio Status Error]:', error);
        }
      }
    };

    monitorAudioStatus();
  }, [sound, isPlaying, currentContent, isBuffering]);

  const handleUnloadAudio = useCallback(async () => {
    console.log('[UnloadAudio] Starting...');
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        console.log('[UnloadAudio] Current status:', status);
        
        await sound.unloadAsync();
        console.log('[UnloadAudio] Sound unloaded successfully');
        
        setSound(null);
        setIsPlaying(false);
        setCurrentContent(null);
        setBufferProgress(0);
      } else {
        console.log('[UnloadAudio] No sound to unload');
      }
    } catch (error) {
      console.error('[UnloadAudio] Error:', error);
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
    console.warn('🎵 [LoadAudio] Starting load process');
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

      console.warn('🎵 [LoadAudio] Sound created successfully');
      
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
      console.error('❌ [LoadAudio] Error:', error);
      setIsBuffering(false);
      setBufferProgress(0);
      await handleUnloadAudio();
      throw error;
    }
  }, [handleUnloadAudio, sound]);

  const handlePlayPause = useCallback(async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          // Verifica se tem buffer suficiente antes de tocar
          const bufferAhead = (status.playableDurationMillis ?? 0) - status.positionMillis;
          if (bufferAhead >= BUFFER_THRESHOLD) {
            await sound.playAsync();
            setIsPlaying(true);
            setIsBuffering(false);
          } else {
            setIsBuffering(true);
            // Inicia o processo de buffering
            await sound.playAsync();
            await sound.pauseAsync();
          }
        }
      }
    } catch (error) {
      console.error('[PlayPause] Error:', error);
    }
  }, [sound, isPlaying]);

  const handleSetPosition = useCallback(async (position: number) => {
    console.log('[SetPosition] Attempting to set position:', position);
    if (!sound) {
      console.log('[SetPosition] No sound available');
      return;
    }
    
    try {
      await sound.setPositionAsync(position);
      const newStatus = await sound.getStatusAsync();
      console.log('[SetPosition] New status:', newStatus);
    } catch (error) {
      console.error('[SetPosition] Error:', error);
    }
  }, [sound]);

  const handleSetLooping = useCallback(async (isLooping: boolean) => {
    console.log('[SetLooping] Attempting to set looping:', isLooping);
    try {
      if (sound?.getStatusAsync) {
        const status = await sound.getStatusAsync();
        console.log('[SetLooping] Current status:', status);
        
        if (status.isLoaded) {
          await sound.setIsLoopingAsync(isLooping);
          const newStatus = await sound.getStatusAsync();
          console.log('[SetLooping] New status:', newStatus);
        } else {
          console.log('[SetLooping] Sound not loaded');
        }
      } else {
        console.log('[SetLooping] No sound available');
      }
    } catch (error) {
      console.error('[SetLooping] Error:', error);
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