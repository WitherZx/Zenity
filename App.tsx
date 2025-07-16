import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
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

  useEffect(() => {
    async function prepare() {
      try {
        // Inicializa o AdMob com tratamento de erro
        try {
          await mobileAds().initialize();
          
          // Configura o AdMob
          await mobileAds().setRequestConfiguration({
            maxAdContentRating: MaxAdContentRating.PG,
            tagForChildDirectedTreatment: true,
            tagForUnderAgeOfConsent: true,
          });
        } catch (adError) {
          // Não falha o app se o AdMob não inicializar
        }

        // Inicializa o RevenueCat com tratamento de erro
        try {
          const revenueCatService = RevenueCatService.getInstance();
          await revenueCatService.initialize();
        } catch (rcError) {
          // Não falha o app se o RevenueCat não inicializar
        }

        // Carrega as fontes
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
      } catch (error) {
        // Mesmo com erro, marca o app como pronto para não travar
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null;
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