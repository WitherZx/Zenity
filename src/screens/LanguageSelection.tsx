import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { fonts } from '../theme/fonts';

export default function LanguageSelection() {
  const { t } = useTranslation();
  const { 
    currentLanguage, 
    changeLanguage, 
    confirmLanguageSelection 
  } = useLanguage();

  const handleLanguageChange = async (language: 'pt' | 'en') => {
    await changeLanguage(language);
  };

  const handleConfirm = async () => {
    await confirmLanguageSelection();
  };

  const isPortuguese = currentLanguage === 'pt';
  const isEnglish = currentLanguage === 'en';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image 
          source={require('../../assets/images/logo2.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />

        {/* Título */}
        <Text style={styles.title}>
          {t('language.selectLanguage')}
        </Text>

        {/* Botões de idioma */}
        <View style={styles.languageOptions}>
          {/* Português */}
          <TouchableOpacity
            style={[
              styles.languageButton,
              isPortuguese && styles.languageButtonSelected
            ]}
            onPress={() => handleLanguageChange('pt')}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flag}>🇧🇷</Text>
              <Text style={[
                styles.languageText,
                isPortuguese && styles.languageTextSelected
              ]}>
                Português
              </Text>
              {isPortuguese && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color="#0097B2" 
                />
              )}
            </View>
          </TouchableOpacity>

          {/* English */}
          <TouchableOpacity
            style={[
              styles.languageButton,
              isEnglish && styles.languageButtonSelected
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flag}>🇺🇸</Text>
              <Text style={[
                styles.languageText,
                isEnglish && styles.languageTextSelected
              ]}>
                English
              </Text>
              {isEnglish && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color="#0097B2" 
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Botão confirmar */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>
            {t('language.continueIn')} {isPortuguese ? 'Português' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0097B2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  languageOptions: {
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flag: {
    fontSize: 32,
  },
  languageText: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: '#E0F7FA',
    flex: 1,
    marginLeft: 15,
  },
  languageTextSelected: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0097B2',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
}); 