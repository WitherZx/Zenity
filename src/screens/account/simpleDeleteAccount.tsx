import { Linking, Alert } from 'react-native';

const handleEmailSupport = () => {
  const email = 'suporte@hnospps.com';
  const subject = 'Account Deletion Request';
  const body = 'Hello, I would like to delete my account in the Zenity app. Please help me with the process.';
  
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.canOpenURL(mailtoUrl).then((supported: boolean) => {
    if (supported) {
      Linking.openURL(mailtoUrl);
    } else {
      Alert.alert(
        'Email not available',
        'Please send an email to suporte@hnospps.com with the subject "Account Deletion Request"'
      );
    }
  });
}; 