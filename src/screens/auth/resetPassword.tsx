import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { TextInput, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';


type NavigationProp = StackNavigationProp<LoginStackParamList>;
type RouteProps = {
  email: string;
  code: string;
};

export default function ResetPassword() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { email, code } = route.params as RouteProps;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>Redefina sua senha</Text>
      <View style={Styles.form}>
        <View style={Styles.passwordContainer}>
          <TextInput 
            placeholder="Senha" 
            style={[Styles.input, { paddingRight: 50 }]}
            placeholderTextColor="#91D2DE"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={Styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
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
            placeholder="Confirmar senha" 
            style={[Styles.input, { paddingRight: 50 }]}
            placeholderTextColor="#91D2DE"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            style={Styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
        <TouchableOpacity style={Styles.button}>
          <Text style={Styles.buttonText}>Criar conta</Text>
        </TouchableOpacity>
        <Text style={Styles.text}>Já tem uma conta? <Text style={Styles.textBold } onPress={() => navigation.navigate('Login')}>Faça login</Text></Text>
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
  buttonText: {
    color: '#0097B2',
    fontFamily: fonts.bold,
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