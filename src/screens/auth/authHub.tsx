import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { LoginStackParamList } from '../../stacks/loginStack';
import { useLanguage } from '../../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrivacyPolicyUrl, getTermsOfServiceUrl } from '../../config/urls';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../config/supabase';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

export default function AuthHub() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { resetLanguageSelection, currentLanguage } = useLanguage();

  const handleLanguageChange = () => {
    // Limpa a seleção de idioma para forçar nova seleção
    AsyncStorage.removeItem('selectedLanguage');
    AsyncStorage.removeItem('selectedRegion');
    
    // Força recarregamento do contexto de idioma
    resetLanguageSelection();
  };

  // Função de login com Google via OAuth Supabase
  const handleGoogleLogin = async () => {
    console.log('Botão Google clicado');
    try {
      // Primeiro, vamos tentar obter a URL de autorização
      const { url, error } = await supabase.auth.signIn({
        provider: 'google',
      });
      
      if (error) {
        console.error('Erro Google:', error);
        alert('Erro ao iniciar login com Google: ' + error.message);
        return;
      }
      
      console.log('Resposta do Supabase:', { url });
      
      // Se temos uma URL, abrir no navegador
      if (url) {
        console.log('Abrindo URL no navegador:', url);
        const result = await WebBrowser.openAuthSessionAsync(url, 'zenity://');
        
        if (result.type === 'success') {
          console.log('Login bem-sucedido!');
          console.log('URL de retorno:', result.url);
          
          // Verificar se o callback foi processado
          if (result.url && result.url.includes('zenity://')) {
            console.log('Callback detectado!');
            console.log('URL completa do callback:', result.url);
          }
        } else if (result.type === 'cancel') {
          console.log('Login cancelado pelo usuário');
        } else {
          console.log('Login falhou:', result.type);
        }
      } else {
        alert('Não foi possível obter a URL de autorização');
      }
    } catch (e) {
      console.error('Erro inesperado Google:', e);
      alert('Erro inesperado ao iniciar login com Google: ' + e);
    }
  };

  // Função de login com Apple via OAuth Supabase
  const handleAppleLogin = async () => {
    console.log('Botão Apple clicado');
    try {
      // Primeiro, vamos tentar obter a URL de autorização
      const { url, error } = await supabase.auth.signIn({
        provider: 'apple',
      });
      
      if (error) {
        console.error('Erro Apple:', error);
        alert('Erro ao iniciar login com Apple: ' + error.message);
        return;
      }
      
      console.log('Resposta do Supabase:', { url });
      
      // Se temos uma URL, abrir no navegador
      if (url) {
        console.log('Abrindo URL no navegador:', url);
        const result = await WebBrowser.openAuthSessionAsync(url, 'zenity://');
        
        if (result.type === 'success') {
          console.log('Login bem-sucedido!');
          console.log('URL de retorno:', result.url);
          
          // Verificar se o callback foi processado
          if (result.url && result.url.includes('zenity://')) {
            console.log('Callback detectado!');
            console.log('URL completa do callback:', result.url);
          }
        } else if (result.type === 'cancel') {
          console.log('Login cancelado pelo usuário');
        } else {
          console.log('Login falhou:', result.type);
        }
      } else {
        alert('Não foi possível obter a URL de autorização');
      }
    } catch (e) {
      console.error('Erro inesperado Apple:', e);
      alert('Erro inesperado ao iniciar login com Apple: ' + e);
    }
  };

  return (
    <View style={Styles.container}>
      <View style={Styles.main}>
        <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
        <Text style={Styles.title}>{t('auth.createAccount')}</Text>
        <TouchableOpacity 
          style={Styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={Styles.buttonText}>{t('auth.continueWithEmail')}</Text>
        </TouchableOpacity>
       <View style={Styles.iconContainer}>
          <TouchableOpacity 
            style={Styles.iconButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
          >
          <Ionicons name="logo-google" style={Styles.icon}/>
          </TouchableOpacity>
          <TouchableOpacity 
            style={Styles.iconButton}
            onPress={handleAppleLogin}
            activeOpacity={0.7}
          >
          <Ionicons name="logo-apple" style={Styles.icon}/>
          </TouchableOpacity>
          {/*<Ionicons name="logo-facebook" style={Styles.icon}/>*/}
        </View>
        <Text style={Styles.text}>
          {t('auth.alreadyHaveAccount')}{' '}
          <Text style={Styles.textBold} onPress={() => navigation.navigate('Login')}>
            {t('auth.login')}
          </Text>
        </Text>
        
        {/* Botão para voltar à seleção de idioma */}
        <TouchableOpacity 
          style={Styles.languageButton}
          onPress={handleLanguageChange}
        >
          <Text style={Styles.languageButtonText}>{t('auth.changeLanguage')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={Styles.textRodape}>
        {t('auth.acceptTerms')}{' '}
        <Text style={[Styles.textRodapeBold, {textDecorationLine: 'underline'}]} onPress={() => Linking.openURL(getTermsOfServiceUrl(currentLanguage))}>
          {t('auth.termsAndConditions')}
        </Text>
        {' '}{t('auth.and')}{' '}
        <Text style={[Styles.textRodapeBold, {textDecorationLine: 'underline'}]} onPress={() => Linking.openURL(getPrivacyPolicyUrl(currentLanguage))}>
          {t('auth.privacyPolicy')}
        </Text>
        {' '}{t('auth.ofZenity')}
      </Text>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0097B2',
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  logo: {
    width: 100,
    height: 170,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0097B2',
    fontFamily: fonts.bold,
  },
  iconContainer: {  
    flexDirection: 'row',
    gap: 20,
  },
  iconButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 5,
  },
  icon: {
    fontSize: 32,
    color: '#0097B2',
  },
  text: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  textBold: {
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  languageButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  textRodape: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  textRodapeBold: {
    fontFamily: fonts.bold,
  },
}); 