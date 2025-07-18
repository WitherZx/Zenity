import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LoginStack from '../stacks/loginStack';
import TabsNav from '../screens/tabs';
import LanguageSelection from '../screens/LanguageSelection';

const Stack = createStackNavigator();

export default function Navigation() {
  const { user, loading: authLoading } = useAuth();
  const { hasSelectedLanguage, loading: languageLoading } = useLanguage();

  console.log('[NAV] Estado da navegação:', { 
    user: user?.id || 'null', 
    authLoading, 
    hasSelectedLanguage, 
    languageLoading 
  });

  // Mostra loading enquanto carrega auth ou idioma
  if (authLoading || languageLoading) {
    console.log('[NAV] Mostrando loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0097B2" />
      </View>
    );
  }

  // Se o usuário ainda não selecionou idioma, mostrar tela de seleção
  if (!hasSelectedLanguage) {
    console.log('[NAV] Mostrando seleção de idioma...');
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Fluxo normal após seleção de idioma
  console.log('[NAV] Decidindo rota:', user ? 'TabsNav' : 'LoginStack');
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="TabsNav" component={TabsNav} />
        ) : (
          <Stack.Screen name="LoginStack" component={LoginStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 