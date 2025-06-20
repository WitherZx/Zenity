import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import LoginStack from '../stacks/loginStack';
import TabsNav from '../screens/tabs';

const Stack = createStackNavigator();

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0097B2" />
      </View>
    );
  }

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