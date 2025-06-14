import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import PageModel2 from '../../components/pageModel2';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    if (isMountedRef.current) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (isMountedRef.current) setLoading(true);
    try {
      const { error } = await signIn(formData.email.trim(), formData.password.trim());
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível fazer login. Tente novamente.');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={Styles.container}>
        <ActivityIndicator size="large" color="#0097B2" />
      </View>
    );
  }

  return (
    <PageModel2 
      icon="log-in-outline" 
      title="login" 
      subtitle="Entre com sua conta"
    >
      <View style={Styles.container}>
        <View style={Styles.form}>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>Email</Text>
            <TextInput 
              placeholder="Email" 
              style={Styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>Senha</Text>
            <TextInput 
              placeholder="Senha" 
              style={Styles.input}
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              editable={!loading}
              secureTextEntry
            />
          </View>
          <View style={Styles.buttonContainer}>
            <TouchableOpacity 
              style={[Styles.button, loading && Styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={Styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={Styles.linkContainer}
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={Styles.linkText}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageModel2>
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
  formItem: {
    width: '100%',
  },
  label: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  linkContainer: {
    width: '100%',
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
});