import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const isFormValid = () => {
    return formData.email.trim() !== '' && formData.password.trim() !== '';
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      Alert.alert('Atenção', 'Funcionalidade de login desativada nesta versão.');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>Bem-vindo de volta!</Text>
      <View style={Styles.form}>
        <TextInput 
          placeholder="Email" 
          style={Styles.input}
          placeholderTextColor="#91D2DE"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <View style={Styles.passwordContainer}>
          <TextInput 
            placeholder="Senha" 
            style={[Styles.input, { paddingRight: 50 }]}
            placeholderTextColor="#91D2DE"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            editable={!loading}
          />
          <TouchableOpacity 
            style={Styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Ionicons 
              name={showPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={Styles.buttonContainer}>
        <TouchableOpacity 
          style={[Styles.button, (!isFormValid() || loading) && Styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#0097B2" />
          ) : (
            <Text style={[Styles.buttonText, !isFormValid() && Styles.buttonTextDisabled]}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>
        <Text style={Styles.text}>
          Não tem uma conta? <Text style={Styles.textBold} onPress={() => navigation.navigate('SignUp')}>Crie agora</Text>
        </Text>
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
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 50,
    backgroundColor: '#0097B2',
    color: '#fff',
    fontFamily: fonts.regular,
  },
  form: {
    width: '100%',
    gap: 10,
  },
  text: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  textBold: {
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonText: {
    color: '#0097B2',
    fontFamily: fonts.bold,
  },
  buttonTextDisabled: {
    color: 'rgba(0, 151, 178, 0.5)',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});