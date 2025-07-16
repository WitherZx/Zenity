import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';

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
      const { user, session, error } = await supabase.auth.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Account not found', 'This email is not registered. Create an account before trying to log in.');
        } else if (error.message.includes('Email not confirmed')) {
          Alert.alert('Email not verified', 'Please verify your email before logging in. Check your inbox and spam.');
        } else {
        Alert.alert('Error', error.message || 'An error occurred during login.');
        }
        return;
      }

      if (user) {
        // Verifica se o email foi confirmado
        if (!user.email_confirmed_at) {
          Alert.alert(
            'Email not verified',
            'Please verify your email before logging in. Check your inbox and spam.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Verifica se existe registro na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          // PGRST116 = 0 rows, ou seja, perfil não existe ainda
          Alert.alert(
            'Error',
            'Could not find your profile. Please contact support.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Verifica se a conta foi deletada
        if (userData && userData.first_name === 'Conta Deletada') {
          Alert.alert(
            'Account Deleted',
            'This account has been deleted and can no longer be accessed.',
            [{ text: 'OK' }]
          );
          // Faz logout para limpar a sessão
          await supabase.auth.signOut();
          return;
        }

        if (!userData) {
          // Cria o perfil se não existir
          const firstName = user.user_metadata?.first_name || '';
          const lastName = user.user_metadata?.last_name || '';
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              is_premium: false,
              profile_url: 'https://ouxrcqjejncpmlaehonk.supabase.co/storage/v1/object/public/user-images//defaultUser.png',
            });
          if (insertError) {
            Alert.alert('Error', 'Error creating user profile. Please try again.');
            return;
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>Welcome back!</Text>
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
            placeholder="Password" 
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
              Sign in
            </Text>
          )}
        </TouchableOpacity>
        <Text style={Styles.text}>
          Don't have an account? <Text style={Styles.textBold} onPress={() => navigation.navigate('SignUp')}>Create one now</Text>
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