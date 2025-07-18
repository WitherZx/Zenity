import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { getSupabaseClient } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const { t } = useTranslation();
  const { refreshPremiumStatus, forceRefreshUser } = useAuth();
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
    console.log('[LOGIN] Iniciando processo de login...');
    
    try {
      const supabase = getSupabaseClient();
      console.log('[LOGIN] Cliente Supabase obtido');
      
      const { user, session, error } = await supabase.auth.signIn({
        email: formData.email,
        password: formData.password,
      });
      console.log('[LOGIN] Resposta do signIn:', { user: user?.id, session: !!session, error: error?.message });

      if (error) {
        console.log('[LOGIN] Erro no signIn:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert(t('auth.accountNotFound'), t('auth.emailNotRegistered'));
        } else if (error.message.includes('Email not confirmed')) {
          Alert.alert(t('auth.emailNotVerified'), t('auth.verifyEmailFirst'));
        } else {
        Alert.alert(t('auth.error'), error.message || t('auth.loginError'));
        }
        return;
      }

      if (user) {
        console.log('[LOGIN] Usuário autenticado:', user.id);
        // Verifica se o email foi confirmado
        if (!user.email_confirmed_at) {
          console.log('[LOGIN] Email não confirmado');
          Alert.alert(
            t('auth.emailNotVerified'),
            t('auth.checkInboxSpam'),
            [{ text: 'OK' }]
          );
          return;
        }

        console.log('[LOGIN] Verificando perfil do usuário...');
        // Verifica se existe registro na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        console.log('[LOGIN] userData:', userData, 'userError:', userError);

        if (userError && userError.code !== 'PGRST116') {
          // PGRST116 = 0 rows, ou seja, perfil não existe ainda
          console.log('[LOGIN] Erro ao buscar perfil:', userError);
          Alert.alert(
            t('auth.error'),
            t('auth.profileNotFound'),
            [{ text: 'OK' }]
          );
          return;
        }

        // Verifica se a conta foi deletada
        if (userData && userData.first_name === t('auth.accountDeleted')) {
          console.log('[LOGIN] Conta deletada detectada');
          Alert.alert(
            t('auth.accountDeleted'),
            t('auth.accountDeletedMessage'),
            [{ text: 'OK' }]
          );
          // Faz logout para limpar a sessão
          await supabase.auth.signOut();
          return;
        }

        if (!userData) {
          console.log('[LOGIN] Criando perfil do usuário...');
          // Cria o perfil se não existir
          const firstName = user.user_metadata?.first_name || '';
          const lastName = user.user_metadata?.last_name || '';
          // Usar URL baseada na região atual
          const { useLanguage } = require('../../contexts/LanguageContext');
          const { region } = useLanguage();
          const supabaseUrl = region === 'usa' 
            ? 'https://ouxrcqjejncpmlaehonk.supabase.co'
            : 'https://cueqhaexkoojemvewdki.supabase.co';
          const defaultProfileUrl = `${supabaseUrl}/storage/v1/object/public/user-images/defaultUser.png`;
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              is_premium: false,
              profile_url: defaultProfileUrl,
            });
          if (insertError) {
            console.log('[LOGIN] Erro ao criar perfil:', insertError);
            Alert.alert(t('auth.error'), t('auth.profileCreationError'));
            return;
          }
          console.log('[LOGIN] Perfil criado com sucesso');
        }
        
        console.log('[LOGIN] Login finalizado com sucesso - aguardando contexto...');
        
        // Verificar se a sessão foi criada corretamente
        const currentSession = supabase.auth.session();
        console.log('[LOGIN] Sessão atual após login:', currentSession?.user?.id || 'null');
        
        // Aguardar um pouco para o contexto processar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // AUTO REFRESH: Forçar atualização do contexto
        console.log('[LOGIN] Forçando atualização do contexto...');
        try {
          // Forçar refresh do usuário
          await forceRefreshUser();
          console.log('[LOGIN] Refresh do usuário concluído');
          
          // Forçar refresh do status premium
          await refreshPremiumStatus();
          console.log('[LOGIN] Refresh do status premium concluído');
        } catch (error) {
          console.log('[LOGIN] Erro no refresh:', error);
        }
        
        // Aguardar mais um pouco para garantir que tudo foi processado
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[LOGIN] Processo de login completamente finalizado');
      }
    } catch (error: any) {
      console.error('[LOGIN] Erro geral no login:', error);
      Alert.alert(t('auth.error'), t('auth.unexpectedError'));
    } finally {
      console.log('[LOGIN] Finalizando handleSubmit');
      setLoading(false);
    }
  };

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>{t('auth.welcomeBack')}</Text>
      <View style={Styles.form}>
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
              {t('auth.enter')}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={Styles.text}>
          {t('auth.dontHaveAccount')} <Text style={Styles.textBold} onPress={() => navigation.navigate('SignUp')}>{t('auth.createNow')}</Text>
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