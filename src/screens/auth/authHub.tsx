import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

export default function AuthHub() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={Styles.container}>
      <View style={Styles.main}>
        <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
        <Text style={Styles.title}>Crie a sua conta</Text>
        <TouchableOpacity 
          style={Styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={Styles.buttonText}>Continuar com email e senha</Text>
        </TouchableOpacity>
        {/*<View style={Styles.iconContainer}>
          <Ionicons name="logo-facebook" style={Styles.icon} onPress={() => console.log('login com Facebook')}/>
          <Ionicons name="logo-apple" style={Styles.icon} onPress={() => console.log('login com Apple')}/>
          <Ionicons name="logo-google" style={Styles.icon} onPress={() => console.log('login com Google')}/>
        </View>*/}
        <Text style={Styles.text}>Já tem uma conta? <Text style={Styles.textBold } onPress={() => navigation.navigate('Login')}>Faça login</Text></Text>
      </View>
      <Text style={Styles.textRodape}>Ao continuar, você aceita os <Text style={Styles.textRodapeBold}>Termos e Condições</Text> e a <Text style={Styles.textRodapeBold}>Política de Privacidade</Text> da Zenity</Text>
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
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
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
  iconContainer: {  
    flexDirection: 'row',
    gap: 20,
  },
  icon: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
    fontSize: 32,
    color: '#0097B2',
  },
  text: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  textBold: {
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  textRodape: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  textRodapeBold: {
    fontFamily: fonts.bold,
  },
}); 