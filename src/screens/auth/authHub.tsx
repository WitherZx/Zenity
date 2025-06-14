import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { useAuth } from '../../contexts/AuthContext';
import PageModel2 from '../../components/pageModel2';
import { fonts } from '../../theme/fonts';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

export default function AuthHub() {
  const navigation = useNavigation<NavigationProp>();
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={Styles.container}>
        <ActivityIndicator size="large" color="#0097B2" />
      </View>
    );
  }

  return (
    <PageModel2 
      icon="person-outline" 
      title="bem-vindo" 
      subtitle="Entre ou crie sua conta"
    >
      <View style={Styles.container}>
        <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
        <View style={Styles.buttonContainer}>
          <TouchableOpacity 
            style={Styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={Styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={Styles.button}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={Styles.buttonText}>Criar Conta</Text>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0097B2',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
}); 