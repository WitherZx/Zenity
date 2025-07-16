import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Linking } from 'react-native';
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
        <Text style={Styles.title}>Create your account</Text>
        <TouchableOpacity 
          style={Styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={Styles.buttonText}>Continue with email and password</Text>
        </TouchableOpacity>
        {/*<View style={Styles.iconContainer}>
          <Ionicons name="logo-facebook" style={Styles.icon}/>
          <Ionicons name="logo-apple" style={Styles.icon}/>
          <Ionicons name="logo-google" style={Styles.icon}/>
        </View>*/}
        <Text style={Styles.text}>Already have an account? <Text style={Styles.textBold } onPress={() => navigation.navigate('Login')}>Sign in</Text></Text>
      </View>
      <Text style={Styles.textRodape}>
        By continuing, you accept the{' '}
        <Text style={[Styles.textRodapeBold, {textDecorationLine: 'underline'}]} onPress={() => Linking.openURL('https://zenity.hnoapps.com/politica-de-privacidade/')}>Terms and Conditions</Text>
        {' '}and the{' '}
        <Text style={[Styles.textRodapeBold, {textDecorationLine: 'underline'}]} onPress={() => Linking.openURL('https://zenity.hnoapps.com/politica-de-privacidade/')}>Privacy Policy</Text>
        {' '}of Zenity
      </Text>
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