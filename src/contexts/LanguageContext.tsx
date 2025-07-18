import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { detectLanguage, PORTUGUESE_COUNTRIES } from '../config/i18n';
import { reconfigureSupabase } from '../config/supabase';
import { CrossRegionAuthService } from '../services/CrossRegionAuthService';
import { NativeModules, Platform } from 'react-native';
import { getSupabaseClient } from '../config/supabase';
import { useAuth } from './AuthContext';
import RevenueCatService from '../services/revenueCatService';

interface LanguageContextData {
  currentLanguage: 'pt' | 'en';
  detectedLanguage: 'pt' | 'en';
  hasSelectedLanguage: boolean;
  loading: boolean;
  region: 'brazil' | 'usa';
  changeLanguage: (language: 'pt' | 'en') => Promise<void>;
  changeLanguageWithAuth: (language: 'pt' | 'en', userEmail?: string, userPassword?: string) => Promise<void>;
  confirmLanguageSelection: () => Promise<void>;
  resetLanguageSelection: () => Promise<void>;
  forceRedetectLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextData>({
  currentLanguage: 'pt',
  detectedLanguage: 'pt',
  hasSelectedLanguage: false,
  loading: true,
  region: 'brazil',
  changeLanguage: async () => {},
  changeLanguageWithAuth: async () => {},
  confirmLanguageSelection: async () => {},
  resetLanguageSelection: async () => {},
  forceRedetectLanguage: async () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<'pt' | 'en'>('pt');
  const [detectedLanguage, setDetectedLanguage] = useState<'pt' | 'en'>('pt');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<'brazil' | 'usa'>('brazil');
  const { i18n } = useTranslation();
  const { clearAuthState } = useAuth();

  // Inicializar contexto de idioma
  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Detectar idioma do dispositivo
      const detected = detectLanguage();
      setDetectedLanguage(detected);

      // Verificar se o usuário já selecionou um idioma
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      const languageSelected = await AsyncStorage.getItem('hasSelectedLanguage');

      let finalLanguage = detected;
      let finalRegion: 'brazil' | 'usa' = detected === 'pt' ? 'brazil' : 'usa';

      if (savedLanguage && languageSelected === 'true') {
        // Usuário já selecionou, usar idioma salvo
        finalLanguage = savedLanguage as 'pt' | 'en';
        finalRegion = savedLanguage === 'pt' ? 'brazil' : 'usa';
        setCurrentLanguage(finalLanguage);
        setHasSelectedLanguage(true);
      } else {
        // Primeira vez, usar idioma detectado mas não marcar como selecionado
        setCurrentLanguage(detected);
        setHasSelectedLanguage(false);
      }

      // Configurar i18n
      await i18n.changeLanguage(finalLanguage);
      setRegion(finalRegion);
      
      // Reconfigurar Supabase baseado na região
      await reconfigureSupabase();
      
    } catch (error) {
      console.error('LanguageContext: Erro ao inicializar idioma:', error);
      // Em caso de erro, usar padrões
      setCurrentLanguage('pt');
      setDetectedLanguage('pt');
      setRegion('brazil');
      
      // Garantir que Supabase está configurado mesmo em caso de erro
      try {
        await reconfigureSupabase();
      } catch (supabaseError) {
        console.error('LanguageContext: Erro crítico ao configurar Supabase:', supabaseError);
      }
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (language: 'pt' | 'en') => {
    try {
      // Atualizar o estado primeiro
      setCurrentLanguage(language);
      
      // Atualizar o i18n
      await i18n.changeLanguage(language);
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('selectedLanguage', language);
      await AsyncStorage.setItem('hasSelectedLanguage', 'true');
      
      // Definir região baseada no idioma
      const newRegion = language === 'pt' ? 'brazil' : 'usa';
      setRegion(newRegion);
      await AsyncStorage.setItem('selectedRegion', newRegion);
      
      // Limpar estado de autenticação para evitar conflitos
      await clearAuthState();
      
      // Aguardar um pouco antes de reconfigurar
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reconfigurar Supabase com credenciais da nova região
      await reconfigureSupabase();
      
      // Reconfigurar RevenueCat para a nova região
      try {
        const revenueCatService = RevenueCatService.getInstance();
        await revenueCatService.reinitialize(newRegion);
      } catch (error) {
        console.error('LanguageContext: Erro ao reconfigurar RevenueCat:', error);
        // Não falhar se RevenueCat não conseguir reconfigurar
      }
      
    } catch (error) {
      console.error('LanguageContext: Erro ao trocar idioma:', error);
    }
  };

  const changeLanguageWithAuth = async (language: 'pt' | 'en', userEmail?: string, userPassword?: string) => {
    try {
      const newRegion = language === 'pt' ? 'brazil' : 'usa';
      const crossRegionService = CrossRegionAuthService.getInstance();
      
      // Se não temos email/senha, só troca o idioma normalmente
      if (!userEmail || !userPassword) {
        await changeLanguage(language);
        return;
      }

      // 1. Verificar se já existe sessão na região de destino
      const existingSession = await crossRegionService.getRegionSession(newRegion);
      if (existingSession) {
        const restored = await crossRegionService.restoreSessionInRegion(existingSession, newRegion);
        if (restored) {
          await changeLanguage(language);
          return;
        }
      }

      // 2. Verificar se usuário existe na região de destino
      const userExists = await crossRegionService.checkUserExistsInRegion(userEmail, newRegion);
      
      if (userExists) {
        // Usuário existe, só precisa fazer login
        Alert.alert(
          'Conta encontrada',
          `Sua conta foi encontrada na região ${newRegion === 'brazil' ? 'Brasil' : 'EUA'}. Fazendo login...`,
          [{ text: 'OK' }]
        );
        
        // Implementar login aqui se necessário
        await changeLanguage(language);
        return;
      }

      // 3. Usuário não existe, perguntar se quer criar
      Alert.alert(
        'Criar conta na nova região?',
        `Sua conta não existe na região ${newRegion === 'brazil' ? 'Brasil' : 'EUA'}. Deseja criar automaticamente?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Criar',
            onPress: async () => {
              try {
                // Obter dados do usuário atual
                const currentRegion = currentLanguage === 'pt' ? 'brazil' : 'usa';
                const currentUserData = await crossRegionService.getCurrentUserData(currentRegion);
                
                if (!currentUserData) {
                  Alert.alert('Erro', 'Não foi possível obter dados do usuário atual');
                  return;
                }

                // Criar conta na nova região
                const result = await crossRegionService.createAccountInRegion(
                  userEmail,
                  userPassword,
                  currentUserData,
                  newRegion
                );

                if (result.success && result.session) {
                  // Salvar sessão da nova região
                  await crossRegionService.saveRegionSession(newRegion, result.session);
                  
                  Alert.alert(
                    'Sucesso!',
                    `Conta criada com sucesso na região ${newRegion === 'brazil' ? 'Brasil' : 'EUA'}!`,
                    [{ text: 'OK' }]
                  );

                  // Trocar idioma/região
                  await changeLanguage(language);
                } else {
                  Alert.alert('Erro', result.error || 'Falha ao criar conta');
                }
              } catch (error) {
                console.error('LanguageContext: Erro ao criar conta:', error);
                Alert.alert('Erro', 'Erro inesperado ao criar conta');
              }
            },
          },
        ]
      );

    } catch (error) {
      console.error('LanguageContext: Erro ao trocar idioma com auth:', error);
      Alert.alert('Erro', 'Erro ao processar troca de região');
    }
  };

  const confirmLanguageSelection = async () => {
    try {
      await AsyncStorage.setItem('hasSelectedLanguage', 'true');
      setHasSelectedLanguage(true);
    } catch (error) {
      console.error('LanguageContext: Erro ao confirmar seleção de idioma:', error);
    }
  };

  const resetLanguageSelection = async () => {
    try {
      await AsyncStorage.removeItem('selectedLanguage');
      await AsyncStorage.removeItem('selectedRegion');
      await AsyncStorage.removeItem('hasSelectedLanguage');
      setHasSelectedLanguage(false);
    } catch (error) {
      console.error('LanguageContext: Erro ao resetar seleção de idioma:', error);
    }
  };

  const forceRedetectLanguage = async () => {
    try {
      await resetLanguageSelection();
      await initializeLanguage();
    } catch (error) {
      console.error('LanguageContext: Erro ao forçar redetecção de idioma:', error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        detectedLanguage,
        hasSelectedLanguage,
        loading,
        region,
        changeLanguage,
        changeLanguageWithAuth,
        confirmLanguageSelection,
        resetLanguageSelection,
        forceRedetectLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  }
  return context;
} 