import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { getSupabaseClient } from '../../config/supabase';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUp() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isFormValid = () => {
    return formData.firstName.trim() !== '' &&
           formData.lastName.trim() !== '' &&
           formData.email.trim() !== '' &&
           formData.password.trim() !== '' &&
           formData.confirmPassword.trim() !== '' &&
           formData.password === formData.confirmPassword;
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
      const supabase = getSupabaseClient();
      
      const { user, session, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          Alert.alert(t('auth.userExists'), t('auth.userExistsMessage'));
        } else if (error.message.includes('Password should be at least')) {
          Alert.alert(t('auth.weakPassword'), t('auth.passwordRequirements'));
        } else {
          Alert.alert(t('auth.error'), error.message || t('auth.signUpError'));
        }
        return;
      }

      if (user) {
        // Atualiza os metadados do usuário
        await supabase.auth.update({
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        });

        // Usar URL baseada na região atual
        const { useLanguage } = require('../../contexts/LanguageContext');
        const { region } = useLanguage();
        const supabaseUrl = region === 'usa' 
          ? 'https://ouxrcqjejncpmlaehonk.supabase.co'
          : 'https://cueqhaexkoojemvewdki.supabase.co';
        const defaultProfileUrl = `${supabaseUrl}/storage/v1/object/public/user-images/defaultUser.png`;
        
        // Cria o perfil do usuário
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            is_premium: false,
            profile_url: defaultProfileUrl,
          });

        if (insertError) {
          Alert.alert(t('auth.error'), t('auth.profileCreationError'));
          return;
        }

        Alert.alert(
          t('auth.verificationSent'),
          t('auth.checkEmailSpam'),
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(t('auth.error'), t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>{t('auth.createYourAccount')}</Text>
      <View style={Styles.form}>
        <View style={Styles.row}>
          <View style={Styles.rowItem}>
            <TextInput 
              placeholder={t('auth.firstName')} 
              style={Styles.input}
              placeholderTextColor="#91D2DE"
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              editable={!loading}
            />
          </View>
          <View style={Styles.rowItem}>
            <TextInput 
              placeholder={t('auth.lastName')} 
              style={Styles.input}
              placeholderTextColor="#91D2DE"
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              editable={!loading}
            />
          </View>
        </View>
        
        <TextInput 
          placeholder={t('auth.email')} 
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
            placeholder={t('auth.password')} 
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

        <View style={Styles.passwordContainer}>
          <TextInput 
            placeholder={t('auth.confirmPassword')} 
            style={[Styles.input, { paddingRight: 50 }]}
            placeholderTextColor="#91D2DE"
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            editable={!loading}
          />
          <TouchableOpacity 
            style={Styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off" : "eye"} 
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
              {t('auth.createAccount')}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={Styles.text}>
          {t('auth.alreadyHaveAccount')} <Text style={Styles.textBold} onPress={() => navigation.navigate('Login')}>{t('auth.login')}</Text>
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
  textBold: {
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  textLink: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
}); 