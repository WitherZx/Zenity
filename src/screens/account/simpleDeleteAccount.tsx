const handleEmailSupport = () => {
  const email = 'suporte@hnospps.com';
  const subject = 'Solicitação de Deletar Conta';
  const body = 'Olá, gostaria de deletar minha conta no app Zenity. Por favor, me ajude com o processo.';
  
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.canOpenURL(mailtoUrl).then(supported => {
    if (supported) {
      Linking.openURL(mailtoUrl);
    } else {
      Alert.alert(
        'Email não disponível',
        'Por favor, envie um email para suporte@hnospps.com com o assunto "Solicitação de Deletar Conta"'
      );
    }
  });
}; 