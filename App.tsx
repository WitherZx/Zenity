import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { PlayerProvider } from './src/contexts/PlayerContext';
import Navigation from './src/navigation';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import RevenueCatService from './src/services/revenueCatService';

// Mantenha a splash screen visível enquanto carregamos recursos
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('App: Iniciando carregamento...');

        // Carrega as fontes PRIMEIRO (crítico)
        console.log('App: Carregando fontes...');
        await Font.loadAsync({
          'Montserrat-Thin': require('./assets/fonts/Montserrat-Thin.ttf'),
          'Montserrat-ExtraLight': require('./assets/fonts/Montserrat-ExtraLight.ttf'),
          'Montserrat-Light': require('./assets/fonts/Montserrat-Light.ttf'),
          'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
          'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
          'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
          'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
          'Montserrat-ExtraBold': require('./assets/fonts/Montserrat-ExtraBold.ttf'),
          'Montserrat-Black': require('./assets/fonts/Montserrat-Black.ttf'),
          'Montserrat-ThinItalic': require('./assets/fonts/Montserrat-ThinItalic.ttf'),
          'Montserrat-ExtraLightItalic': require('./assets/fonts/Montserrat-ExtraLightItalic.ttf'),
          'Montserrat-LightItalic': require('./assets/fonts/Montserrat-LightItalic.ttf'),
          'Montserrat-Italic': require('./assets/fonts/Montserrat-Italic.ttf'),
          'Montserrat-MediumItalic': require('./assets/fonts/Montserrat-MediumItalic.ttf'),
          'Montserrat-SemiBoldItalic': require('./assets/fonts/Montserrat-SemiBoldItalic.ttf'),
          'Montserrat-BoldItalic': require('./assets/fonts/Montserrat-BoldItalic.ttf'),
          'Montserrat-ExtraBoldItalic': require('./assets/fonts/Montserrat-ExtraBoldItalic.ttf'),
          'Montserrat-BlackItalic': require('./assets/fonts/Montserrat-BlackItalic.ttf'),
        });
        console.log('App: Fontes carregadas com sucesso');

        // Inicializa o AdMob (não crítico - pode falhar)
        try {
          console.log('App: Inicializando AdMob...');
          await mobileAds().initialize();
          
          // Configura o AdMob
          await mobileAds().setRequestConfiguration({
            maxAdContentRating: MaxAdContentRating.PG,
            tagForChildDirectedTreatment: true,
            tagForUnderAgeOfConsent: true,
          });
          console.log('App: AdMob inicializado com sucesso');
        } catch (adError) {
          console.log('App: AdMob falhou, continuando sem publicidade:', adError);
        }

        // Inicializa o RevenueCat (não crítico - pode falhar)
        try {
          console.log('App: Inicializando RevenueCat...');
          const revenueCatService = RevenueCatService.getInstance();
          await revenueCatService.initialize();
          console.log('App: RevenueCat inicializado com sucesso');
        } catch (rcError) {
          console.log('App: RevenueCat falhou, continuando sem premium:', rcError);
        }

        console.log('App: Carregamento concluído com sucesso');
      } catch (error) {
        console.error('App: Erro crítico no carregamento:', error);
        setLoadingError(true);
      } finally {
        setAppIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.log('App: Erro ao esconder splash screen:', splashError);
        }
      }
    }
    
    prepare();
  }, []);

  // Loading screen melhorado
  if (!appIsReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#667eea'
      }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ 
          color: 'white', 
          marginTop: 20, 
          fontSize: 16,
          fontWeight: '600'
        }}>
          Carregando Zenity...
        </Text>
      </View>
    );
  }

  // Error screen para casos críticos
  if (loadingError) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#e53e3e',
        padding: 20
      }}>
        <Text style={{ 
          color: 'white', 
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 10
        }}>
          Erro ao carregar o app
        </Text>
        <Text style={{ 
          color: 'white', 
          fontSize: 14,
          textAlign: 'center'
        }}>
          Tente reiniciar o aplicativo
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthProvider>
        <PlayerProvider>
          <Navigation />
        </PlayerProvider>
      </AuthProvider>
    </View>
  );
}