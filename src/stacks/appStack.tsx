import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home';

export type AppStackParamList = {
  Home: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
} 