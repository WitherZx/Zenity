import { Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

const handleEmailSupport = () => {
  const { t } = useTranslation();
  
  const email = 'suporte@hnospps.com';
  const subject = t('account.deleteAccountRequest');
  const body = t('account.deleteAccountEmailBody');
  
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.canOpenURL(mailtoUrl).then(supported => {
    if (supported) {
      Linking.openURL(mailtoUrl);
    } else {
      Alert.alert(
        t('account.emailNotAvailable'),
        t('account.emailNotAvailableMessage')
      );
    }
  });
}; 