import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

// Arquivos de tradução
import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';

// Países que falam português
export const PORTUGUESE_COUNTRIES = [
  'BR', // Brasil
  'PT', // Portugal
  'AO', // Angola
  'MZ', // Moçambique
  'CV', // Cabo Verde
  'GW', // Guiné-Bissau
  'ST', // São Tomé e Príncipe
  'TL', // Timor-Leste
  'MO', // Macau
];

// Países que falam inglês
export const ENGLISH_COUNTRIES = [
  'US', // Estados Unidos
  'GB', // Reino Unido
  'CA', // Canadá
  'AU', // Austrália
  'NZ', // Nova Zelândia
  'IE', // Irlanda
  'ZA', // África do Sul
  'IN', // Índia
  'SG', // Singapura
  'HK', // Hong Kong
  'MY', // Malásia
  'PH', // Filipinas
  'NG', // Nigéria
  'KE', // Quênia
  'GH', // Gana
  'UG', // Uganda
  'ZW', // Zimbábue
  'BW', // Botsuana
  'MW', // Malawi
  'ZM', // Zâmbia
  'TZ', // Tanzânia
  'RW', // Ruanda
  'ET', // Etiópia
  'LR', // Libéria
  'SL', // Serra Leoa
  'GM', // Gâmbia
];

// Função para obter locale do dispositivo sem react-native-localize
const getDeviceLocale = () => {
  try {
    // Para Android
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.locale || 'en-US';
      return locale;
    }
    // Para iOS
    else if (Platform.OS === 'ios') {
      const locale = NativeModules.SettingsManager?.settings?.AppleLocale || 
                    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 
                    'en-US';
      return locale;
    }
    // Fallback
    return 'en-US';
  } catch (error) {
    console.log('❌ Erro ao obter locale do dispositivo:', error);
    return 'en-US';
  }
};

// Detectar idioma automático baseado no locale do dispositivo
export const detectLanguage = (): 'pt' | 'en' => {
  const deviceLocale = getDeviceLocale();
  
  console.log('🔍 Detectando idioma...');
  console.log('📱 Locale do dispositivo:', deviceLocale);
  
  if (deviceLocale) {
    const languageCode = deviceLocale.split('-')[0].toLowerCase();
    const countryCode = deviceLocale.split('-')[1]?.toUpperCase();
    
    console.log('🌍 Idioma detectado:', languageCode);
    console.log('🌍 País detectado:', countryCode);
    
    // PRIORIDADE 1: Verificar pelo código de idioma primeiro
    if (languageCode === 'pt' || languageCode === 'pt-br' || languageCode === 'pt-pt') {
      console.log('✅ Idioma é português, retornando: pt');
      return 'pt';
    }
    
    if (languageCode === 'en' || languageCode === 'en-us' || languageCode === 'en-gb') {
      console.log('✅ Idioma é inglês, retornando: en');
      return 'en';
    }
    
    // PRIORIDADE 2: Verificar pelo país se o idioma não foi reconhecido
    if (countryCode && PORTUGUESE_COUNTRIES.includes(countryCode)) {
      console.log('✅ País fala português, retornando: pt');
      return 'pt';
    }
    
    if (countryCode && ENGLISH_COUNTRIES.includes(countryCode)) {
      console.log('✅ País fala inglês, retornando: en');
      return 'en';
    }
    
    console.log('❓ Idioma/país não reconhecido, usando padrão: en');
  } else {
    console.log('❌ Nenhum locale encontrado, usando padrão: en');
  }
  
  // Padrão para inglês se não conseguir detectar
  return 'en';
};

// Configuração do i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      pt: {
        translation: ptBR,
      },
      en: {
        translation: enUS,
      },
    },
    lng: 'pt', // Idioma padrão, será sobrescrito pelo LanguageContext
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Importante para React Native
    },
  });

export default i18n; 