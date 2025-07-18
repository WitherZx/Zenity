export const APP_URLS = {
  PRIVACY_POLICY: {
    PT: 'https://zenity.hnoapps.com/politica-de-privacidade/',
    EN: 'https://zenity.hnoapps.com/privacy-policy/'
  },
  TERMS_OF_SERVICE: {
    PT: 'https://zenity.hnoapps.com/politica-de-privacidade/', // Mesma URL por enquanto
    EN: 'https://zenity.hnoapps.com/privacy-policy/' // Mesma URL por enquanto
  }
} as const;

export const getPrivacyPolicyUrl = (language: 'pt' | 'en') => {
  return language === 'en' ? APP_URLS.PRIVACY_POLICY.EN : APP_URLS.PRIVACY_POLICY.PT;
};

export const getTermsOfServiceUrl = (language: 'pt' | 'en') => {
  return language === 'en' ? APP_URLS.TERMS_OF_SERVICE.EN : APP_URLS.TERMS_OF_SERVICE.PT;
}; 