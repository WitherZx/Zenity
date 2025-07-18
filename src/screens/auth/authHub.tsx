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
        {/*<View style={Styles.iconContainer}>
          <Ionicons name="logo-facebook" style={Styles.icon}/>
          <Ionicons name="logo-apple" style={Styles.icon}/>
          <Ionicons name="logo-google" style={Styles.icon}/>
        </View>*/}
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
  icon: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
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