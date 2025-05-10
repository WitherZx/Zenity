import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

type Props = {
  route: {
    params: {
      email: string;
    };
  };
};

export default function VerifyEmail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { email } = route.params;

  const handleResend = async () => {
    alert('Funcionalidade de reenviar email de verificação está desativada.');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={styles.logo} />
      <Text style={styles.title}>Verifique seu email</Text>
      <Text style={styles.subtitle}>
        Enviamos um link de verificação para {email}
      </Text>
      <Text style={styles.description}>
        Por favor, verifique sua caixa de entrada e clique no link para confirmar seu email.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>
            Voltar para Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>Reenviar email de verificação</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0097B2',
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#fff',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#fff',
    textAlign: 'center',
    marginTop: -10,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
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
  resendText: {
    color: '#fff',
    fontFamily: fonts.regular,
    textDecorationLine: 'underline',
  },
}); 