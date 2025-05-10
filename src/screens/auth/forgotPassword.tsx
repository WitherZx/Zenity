import React, { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

export default function ForgotPassword() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      Alert.alert('Atenção', 'Funcionalidade de recuperação de senha desativada nesta versão.');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao enviar email de redefinição.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return email.trim() !== '';
  };

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>Perdeu sua senha?</Text>
      <View style={Styles.form}>
        <Text style={Styles.text}>Receba o código para recuperar a senha</Text>
        <TextInput 
          placeholder="Digite o email cadastrado" 
          style={Styles.input}
          placeholderTextColor="#91D2DE"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={Styles.buttonContainer}>
        <TouchableOpacity style={Styles.button} onPress={handleSubmit}>
          <Text style={Styles.buttonText}>Solicitar código</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#fff',
    textAlign: 'center',
  },
  logo: {
    width: 100,
    height: 170,
    resizeMode: 'contain',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 50,
    backgroundColor: '#0097B2',
    color: '#fff',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
    color: '#fff',
    fontFamily: fonts.regular,
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
  buttonContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
});