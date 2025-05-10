import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoginStackParamList } from '../../stacks/loginStack';
import { fonts } from '../../theme/fonts';

type NavigationProp = StackNavigationProp<LoginStackParamList>;

export default function VerifyCode() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) text = text[0];
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next input if there's a value
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={Styles.container}>
      <Image source={require('../../../assets/images/logo2.png')} style={Styles.logo} />
      <Text style={Styles.title}>Verificação</Text>
      <Text style={Styles.subtitle}>Digite o código enviado para o seu email</Text>
      
      <View style={Styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={Styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      <View style={Styles.buttonContainer}>
        <TouchableOpacity 
          style={Styles.button}
          onPress={() => {
            const fullCode = code.join('');
            navigation.navigate('ResetPassword', { 
              email: (route.params as any).email, 
              code: fullCode 
            });
          }}
        >
          <Text style={Styles.buttonText}>Verificar</Text>
        </TouchableOpacity>
        <Text style={Styles.text}>Não recebeu o código? <Text style={Styles.textBold}>Reenviar</Text></Text>
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0097B2',
    paddingVertical: 50,
    paddingHorizontal: 20,
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
    fontSize: 24,
    fontFamily: fonts.bold,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#fff',
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: '#0097B2',
    color: '#fff',
    textAlign: 'center',
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
    marginTop: 20,
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
  text: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  textBold: {
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
});